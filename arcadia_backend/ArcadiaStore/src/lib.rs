use anchor_lang::prelude::*;

pub mod errors;
pub mod events;
pub mod instructions;
pub mod services;
pub mod state;

use instructions::*;

declare_id!("CYVz9ePwR51JvnUdF3ZdEmf5TavfqkJhNkHLf1tjjxAe");

#[program]
pub mod arcadia {
    use super::*;

    pub fn init_store(ctx: Context<InitStore>) -> Result<()> {
        store::init_store_handler(ctx)
    }

    pub fn create_profile(ctx: Context<CreateProfile>, username: String) -> Result<()> {
        profile::create_profile_handler(ctx, username)
    }

    pub fn change_wallet(ctx: Context<ChangeWallet>) -> Result<()> {
        profile::change_wallet_handler(ctx)
    }

    pub fn create_product(ctx: Context<CreateProduct>, input: ProductInput) -> Result<()> {
        product::create_product_handler(ctx, input)
    }

    pub fn update_product(ctx: Context<UpdateProduct>, input: ProductUpdate) -> Result<()> {
        product::update_product_handler(ctx, input)
    }

    pub fn delete_product(ctx: Context<DeleteProduct>) -> Result<()> {
        product::delete_product_handler(ctx)
    }

    pub fn buy_product(ctx: Context<BuyProduct>, quantity: u32) -> Result<()> {
        purchase::buy_product_handler(ctx, quantity)
    }
}
