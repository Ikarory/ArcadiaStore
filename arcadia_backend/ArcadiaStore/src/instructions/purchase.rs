use anchor_lang::prelude::*;
use crate::{
    events::TicketIssued,
    services::{
        delivery::policy_for,
        payment::{PaymentGateway, SolPayment},
    },
    state::{Product, Profile, Store, Ticket},
};

#[derive(Accounts)]
pub struct BuyProduct<'info> {
    #[account(mut, seeds = [b"store"], bump)]
    pub store: Account<'info, Store>,
    #[account(mut)]
    pub product: Account<'info, Product>,
    #[account(init, payer = authority, space = 8 + Ticket::INIT_SPACE,
        seeds = [b"ticket", store.ticket_count.to_le_bytes().as_ref()], bump)]
    pub ticket: Account<'info, Ticket>,
    #[account(has_one = authority)]
    pub buyer_profile: Account<'info, Profile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, address = product.seller)]
    pub seller: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn buy_product_handler(ctx: Context<BuyProduct>, quantity: u32) -> Result<()> {
    // La pasarela de pago se inyecta: el handler solo conoce el trait.
    let payment = SolPayment {
        system_program: ctx.accounts.system_program.to_account_info(),
        from: ctx.accounts.authority.to_account_info(),
        to: ctx.accounts.seller.to_account_info(),
    };

    let product = &mut ctx.accounts.product;
    let total = product.take_stock(quantity)?;
    payment.charge(total)?;

    let notice = policy_for(product.is_illegal).notice(&product.drop_zone);

    let store = &mut ctx.accounts.store;
    let t = &mut ctx.accounts.ticket;
    t.id = store.ticket_count;
    t.buyer = ctx.accounts.authority.key();
    t.product = product.key();
    t.quantity = quantity;
    t.total = total;
    t.is_illegal = product.is_illegal;
    t.notice = notice.clone();
    t.created_at = Clock::get()?.unix_timestamp;
    store.ticket_count += 1;

    emit!(TicketIssued {
        ticket_id: t.id,
        buyer: t.buyer,
        product: t.product,
        total,
        is_illegal: t.is_illegal,
        notice,
    });
    Ok(())
}