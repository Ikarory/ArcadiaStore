use anchor_lang::prelude::*;
use crate::{
    errors::ArcadiaError,
    services::delivery::policy_for,
    state::{Category, Product, Profile, Store},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProductInput {
    pub name: String,
    pub description: String,
    pub image_uri: String,
    pub category: Category,
    pub price: u64,
    pub stock: u32,
    pub is_illegal: bool,
    pub drop_zone: String,
}

impl ProductInput {
    pub fn validate(&self) -> Result<()> {
        require!(self.name.len() <= 40, ArcadiaError::TextTooLong);
        require!(self.description.len() <= 200, ArcadiaError::TextTooLong);
        require!(self.image_uri.len() <= 100, ArcadiaError::TextTooLong);
        require!(self.drop_zone.len() <= 60, ArcadiaError::TextTooLong);
        require!(self.price > 0, ArcadiaError::InvalidPrice);
        policy_for(self.is_illegal).validate_drop_zone(&self.drop_zone)
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProductUpdate {
    pub description: String,
    pub price: u64,
    pub stock: u32,
    pub active: bool,
    pub drop_zone: String,
}

#[derive(Accounts)]
pub struct CreateProduct<'info> {
    #[account(mut, seeds = [b"store"], bump)]
    pub store: Account<'info, Store>,
    #[account(init, payer = seller, space = 8 + Product::INIT_SPACE,
        seeds = [b"product", store.product_count.to_le_bytes().as_ref()], bump)]
    pub product: Account<'info, Product>,
    #[account(constraint = profile.authority == seller.key())]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub seller: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateProduct<'info> {
    #[account(mut, has_one = seller)]
    pub product: Account<'info, Product>,
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct DeleteProduct<'info> {
    #[account(mut, has_one = seller, close = seller)]
    pub product: Account<'info, Product>,
    #[account(mut)]
    pub seller: Signer<'info>,
}

pub fn create_product_handler(ctx: Context<CreateProduct>, input: ProductInput) -> Result<()> {
    input.validate()?;
    let store = &mut ctx.accounts.store;
    let p = &mut ctx.accounts.product;
    p.id = store.product_count;
    p.seller = ctx.accounts.seller.key();
    p.name = input.name;
    p.description = input.description;
    p.image_uri = input.image_uri;
    p.category = input.category;
    p.price = input.price;
    p.stock = input.stock;
    p.is_illegal = input.is_illegal;
    p.drop_zone = input.drop_zone;
    p.active = true;
    store.product_count += 1;
    Ok(())
}

pub fn update_product_handler(ctx: Context<UpdateProduct>, input: ProductUpdate) -> Result<()> {
    require!(
        input.description.len() <= 200 && input.drop_zone.len() <= 60,
        ArcadiaError::TextTooLong
    );
    require!(input.price > 0, ArcadiaError::InvalidPrice);
    let p = &mut ctx.accounts.product;
    policy_for(p.is_illegal).validate_drop_zone(&input.drop_zone)?;
    p.description = input.description;
    p.price = input.price;
    p.stock = input.stock;
    p.active = input.active;
    p.drop_zone = input.drop_zone;
    Ok(())
}

pub fn delete_product_handler(_ctx: Context<DeleteProduct>) -> Result<()> {
    Ok(()) // `close = seller` devuelve la renta
}
