use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

pub trait PaymentGateway {
    fn charge(&self, amount: u64) -> Result<()>;
}

/// Implementacion concreta: pago en SOL.
pub struct SolPayment<'info> {
    pub system_program: AccountInfo<'info>,
    pub from: AccountInfo<'info>,
    pub to: AccountInfo<'info>,
}

impl<'info> PaymentGateway for SolPayment<'info> {
    fn charge(&self, amount: u64) -> Result<()> {
        transfer(
            CpiContext::new(
                self.system_program.clone(),
                Transfer {
                    from: self.from.clone(),
                    to: self.to.clone(),
                },
            ),
            amount,
        )
    }
}
