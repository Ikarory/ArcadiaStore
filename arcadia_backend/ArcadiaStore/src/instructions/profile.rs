use anchor_lang::prelude::*;
use crate::{errors::ArcadiaError, state::Profile};

#[derive(Accounts)]
#[instruction(username: String)]
pub struct CreateProfile<'info> {
    #[account(init, payer = authority, space = 8 + Profile::INIT_SPACE,
        seeds = [b"profile", username.as_bytes()], bump)]
    pub profile: Account<'info, Profile>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ChangeWallet<'info> {
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, Profile>,
    pub authority: Signer<'info>,     // wallet actual
    pub new_authority: Signer<'info>, // wallet nueva
}

pub fn create_profile_handler(ctx: Context<CreateProfile>, username: String) -> Result<()> {
    require!(
        !username.is_empty() && username.len() <= 20,
        ArcadiaError::InvalidName
    );
    let p = &mut ctx.accounts.profile;
    p.authority = ctx.accounts.authority.key();
    p.username = username;
    p.created_at = Clock::get()?.unix_timestamp;
    Ok(())
}

pub fn change_wallet_handler(ctx: Context<ChangeWallet>) -> Result<()> {
    ctx.accounts.profile.authority = ctx.accounts.new_authority.key();
    Ok(())
}
