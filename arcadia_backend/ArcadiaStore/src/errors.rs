use anchor_lang::prelude::*;

#[error_code]
pub enum ArcadiaError {
    #[msg("Nombre invalido")]
    InvalidName,
    #[msg("Texto demasiado largo")]
    TextTooLong,
    #[msg("Precio invalido")]
    InvalidPrice,
    #[msg("Un producto de Arcadia.onion necesita una zona segura de entrega")]
    MissingDropZone,
    #[msg("Producto inactivo")]
    ProductInactive,
    #[msg("Sin stock suficiente")]
    NoStock,
    #[msg("Overflow")]
    Overflow,
}
