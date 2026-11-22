use anchor_lang::prelude::*;
use crate::state::Store;

#[derive(Accounts)]
pub struct InitStore<'info> {
    #[account(init, payer = admin, space = 8 + Store::INIT_SPACE, seeds = [b"store"], bump)]
    pub store: Account<'info, Store>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn init_store_handler(ctx: Context<InitStore>) -> Result<()> {
    let s = &mut ctx.accounts.store;
    s.admin = ctx.accounts.admin.key();
    s.product_count = 0;
    s.ticket_count = 0;
    Ok(())
}
