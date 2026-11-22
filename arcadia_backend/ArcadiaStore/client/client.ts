const program = pg.program;
const wallet = pg.wallet.publicKey;
const sys = web3.SystemProgram.programId;

const u64le = (n: number) => new BN(n).toArrayLike(Buffer, "le", 8);
const pda = (seeds: Buffer[]) =>
  web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];
const storePda = pda([Buffer.from("store")]);
const profilePda = (name: string) =>
  pda([Buffer.from("profile"), Buffer.from(name)]);
const productPda = (id: number) => pda([Buffer.from("product"), u64le(id)]);

// 1. Perfil de vendedor: reusa uno de esta wallet o crea uno nuevo
const perfiles = await program.account.profile.all([
  { memcmp: { offset: 8, bytes: wallet.toBase58() } },
]);
let username: string;
if (perfiles.length > 0) {
  username = perfiles[0].account.username;
  console.log("Usando perfil existente:", username);
} else {
  username = "vend" + Date.now().toString().slice(-6);
  await program.methods
    .createProfile(username)
    .accounts({
      profile: profilePda(username),
      authority: wallet,
      systemProgram: sys,
    })
    .rpc();
  console.log("Perfil creado:", username);
}

// 2. Producto legal
const store = await program.account.store.fetch(storePda);
const id = store.productCount.toNumber();

await program.methods
  .createProduct({
    name: "Gameboy clasica",
    description: "Consola portatil de antes del colapso",
    imageUri: "ipfs://gameboy",
    category: { retro: {} },
    price: new BN(Math.round(0.01 * web3.LAMPORTS_PER_SOL)),
    stock: 5,
    isIllegal: false,
    dropZone: "",
  })
  .accounts({
    store: storePda,
    product: productPda(id),
    profile: profilePda(username),
    seller: wallet,
    systemProgram: sys,
  })
  .rpc();

console.log("Producto creado con id:", id);
