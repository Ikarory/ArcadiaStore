use anchor_lang::prelude::*;
use crate::errors::ArcadiaError;

#[account]
#[derive(InitSpace)]
pub struct Store {
    pub admin: Pubkey,
    pub product_count: u64,
    pub ticket_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Profile {
    pub authority: Pubkey,
    #[max_len(20)]
    pub username: String,
    pub created_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum Category {
    Retro,
    Robopartes,
    Protesis,
    Armas,
    Hardware,
    Otro,
}

#[account]
#[derive(InitSpace)]
pub struct Product {
    pub id: u64,
    pub seller: Pubkey,
    #[max_len(40)]
    pub name: String,
    #[max_len(200)]
    pub description: String,
    #[max_len(500)]
    pub image_uri: String,
    pub category: Category,
    pub price: u64, // lamports
    pub stock: u32,
    pub is_illegal: bool,
    #[max_len(60)]
    pub drop_zone: String,
    pub active: bool,
}

impl Product {
    //descuenta el stock disponible y devuelve el total a cobrar
    pub fn take_stock(&mut self, quantity: u32) -> Result<u64> {
        require!(self.active, ArcadiaError::ProductInactive);
        require!(
            quantity > 0 && self.stock >= quantity,
            ArcadiaError::NoStock
        );
        let total = self
            .price
            .checked_mul(quantity as u64)
            .ok_or(ArcadiaError::Overflow)?;
        self.stock -= quantity;
        Ok(total)
    }
}

#[account]
#[derive(InitSpace)]
pub struct Ticket {
    pub id: u64,
    pub buyer: Pubkey,
    pub product: Pubkey,
    pub quantity: u32,
    pub total: u64,
    pub is_illegal: bool,
    #[max_len(200)]
    pub notice: String,
    pub created_at: i64,
}
