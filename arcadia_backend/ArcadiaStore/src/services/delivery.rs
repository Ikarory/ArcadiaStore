use anchor_lang::prelude::*;
use crate::errors::ArcadiaError;

/// Contrato de entrega: cada politíca decide su validacion y su aviso.
pub trait DeliveryPolicy {
    fn validate_drop_zone(&self, zone: &str) -> Result<()>;
    fn notice(&self, zone: &str) -> String;
}

pub struct StandardDelivery;
pub struct ClandestineDelivery;

impl DeliveryPolicy for StandardDelivery {
    fn validate_drop_zone(&self, _zone: &str) -> Result<()> {
        Ok(())
    }
    fn notice(&self, _zone: &str) -> String {
        String::from("Entrega normal en punto acordado")
    }
}

impl DeliveryPolicy for ClandestineDelivery {
    fn validate_drop_zone(&self, zone: &str) -> Result<()> {
        require!(!zone.is_empty(), ArcadiaError::MissingDropZone);
        Ok(())
    }
    fn notice(&self, zone: &str) -> String {
        format!(
            "Producto potencialmente ilegal por la federacion: ajusta a un terreno lejos de las zonas urbanas: {}",
            zone
        )
    }
}

static STANDARD: StandardDelivery = StandardDelivery;
static CLANDESTINE: ClandestineDelivery = ClandestineDelivery;

/// Unico lugar donde se elige la politíca. para una nueva, solo la agregamos aquí
pub fn policy_for(is_illegal: bool) -> &'static dyn DeliveryPolicy {
    if is_illegal {
        &CLANDESTINE
    } else {
        &STANDARD
    }
}
