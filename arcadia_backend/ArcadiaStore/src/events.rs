use anchor_lang::prelude::*;

#[event]
pub struct TicketIssued {
    pub ticket_id: u64,
    pub buyer: Pubkey,
    pub product: Pubkey,
    pub total: u64,
    pub is_illegal: bool,
    pub notice: String,
}
