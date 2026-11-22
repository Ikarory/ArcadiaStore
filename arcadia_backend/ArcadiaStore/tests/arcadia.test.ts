describe("Arcadia", () => {
  const program = pg.program;
  const buyer = web3.Keypair.generate();
  const newWallet = web3.Keypair.generate();
  let seller: web3.PublicKey;

  const suffix = Date.now().toString().slice(-6);
  const sellerName = `vend${suffix}`;
  const buyerName = `comp${suffix}`;
  const sys = web3.SystemProgram.programId;
  const sol = (n: number) => Math.round(n * web3.LAMPORTS_PER_SOL);

  // Devnet tarda un poco en reflejar escrituras recientes; esta pausa evita lecturas viejas.
  const sleep = async (ms: number) => {
    const end = Date.now() + ms;
    while (Date.now() < end) {}
  };
  const settle = () => sleep(1500);

  const u64le = (n: number) => new BN(n).toArrayLike(Buffer, "le", 8);
  const pda = (seeds: Buffer[]) =>
    web3.PublicKey.findProgramAddressSync(seeds, program.programId)[0];
  const storePda = pda([Buffer.from("store")]);
  const profilePda = (name: string) =>
    pda([Buffer.from("profile"), Buffer.from(name)]);
  const productPda = (id: number) => pda([Buffer.from("product"), u64le(id)]);
  const ticketPda = (id: number) => pda([Buffer.from("ticket"), u64le(id)]);

  async function expectFail(p: Promise<unknown>, msg: string) {
    try {
      await p;
    } catch (_) {
      return;
    }
    assert.fail(msg);
  }

  const baseProduct = {
    name: "Gameboy clasica",
    description: "Consola portatil de antes del colapso",
    imageUri: "ipfs://gameboy",
    category: { retro: {} },
    price: new BN(sol(0.01)),
    stock: 3,
    isIllegal: false,
    dropZone: "",
  };

  before(async () => {
    assert.ok(
      pg.wallet,
      "Conecta la wallet de Playground antes de correr el test"
    );
    seller = pg.wallet.publicKey;

    // fondos para la wallet compradora
    const tx = new web3.Transaction().add(
      web3.SystemProgram.transfer({
        fromPubkey: seller,
        toPubkey: buyer.publicKey,
        lamports: sol(0.2),
      })
    );
    await program.provider.sendAndConfirm!(tx);
    await settle();
  });

  after(async () => {
    // devuelve el SOL sobrante del comprador a la wallet principal
    try {
      const bal = await program.provider.connection.getBalance(buyer.publicKey);
      if (bal > 0) {
        const tx = new web3.Transaction().add(
          web3.SystemProgram.transfer({
            fromPubkey: buyer.publicKey,
            toPubkey: seller,
            lamports: bal,
          })
        );
        await program.provider.sendAndConfirm!(tx, [buyer]);
      }
    } catch (_) {
      // si falla, no pasa nada: es una wallet desechable
    }
  });

  it("inicializa la tienda (una sola vez)", async () => {
    const existing = await program.account.store.fetchNullable(storePda);
    if (!existing) {
      await program.methods
        .initStore()
        .accounts({ store: storePda, admin: seller, systemProgram: sys })
        .rpc();
      await settle();
    }
    const store = await program.account.store.fetch(storePda);
    assert.ok(store);
  });

  it("crea perfiles de vendedor y comprador", async () => {
    await program.methods
      .createProfile(sellerName)
      .accounts({
        profile: profilePda(sellerName),
        authority: seller,
        systemProgram: sys,
      })
      .rpc();

    await program.methods
      .createProfile(buyerName)
      .accounts({
        profile: profilePda(buyerName),
        authority: buyer.publicKey,
        systemProgram: sys,
      })
      .signers([buyer])
      .rpc();
    await settle();

    const p = await program.account.profile.fetch(profilePda(buyerName));
    assert.equal(p.username, buyerName);
    assert.ok(p.authority.equals(buyer.publicKey));
  });

  let legalId: number;
  let illegalId: number;

  it("CREATE: producto legal", async () => {
    const store = await program.account.store.fetch(storePda);
    legalId = store.productCount.toNumber();

    await program.methods
      .createProduct(baseProduct)
      .accounts({
        store: storePda,
        product: productPda(legalId),
        profile: profilePda(sellerName),
        seller,
        systemProgram: sys,
      })
      .rpc();
    await settle();

    const prod = await program.account.product.fetch(productPda(legalId));
    assert.equal(prod.name, baseProduct.name);
    assert.equal(prod.stock, 3);
    assert.ok(prod.active);
  });

  it("CREATE: ilegal sin zona de entrega falla", async () => {
    const store = await program.account.store.fetch(storePda);
    const id = store.productCount.toNumber();

    await expectFail(
      program.methods
        .createProduct({
          ...baseProduct,
          name: "Ojo biomecanico de 2da gen",
          isIllegal: true,
          dropZone: "",
        })
        .accounts({
          store: storePda,
          product: productPda(id),
          profile: profilePda(sellerName),
          seller,
          systemProgram: sys,
        })
        .rpc(),
      "debio fallar sin dropZone"
    );
  });

  it("CREATE: producto ilegal con zona de entrega", async () => {
    const store = await program.account.store.fetch(storePda);
    illegalId = store.productCount.toNumber();

    await program.methods
      .createProduct({
        ...baseProduct,
        name: "Ojo biomecanico de 2da gen",
        category: { protesis: {} },
        isIllegal: true,
        dropZone: "Cercanias de Antigua Tepic, Sector 21",
        stock: 1,
      })
      .accounts({
        store: storePda,
        product: productPda(illegalId),
        profile: profilePda(sellerName),
        seller,
        systemProgram: sys,
      })
      .rpc();
    await settle();

    const prod = await program.account.product.fetch(productPda(illegalId));
    assert.ok(prod.isIllegal);
  });

  it("UPDATE: el vendedor cambia el precio", async () => {
    await program.methods
      .updateProduct({
        description: "Edicion restaurada",
        price: new BN(sol(0.02)),
        stock: 3,
        active: true,
        dropZone: "",
      })
      .accounts({ product: productPda(legalId), seller })
      .rpc();
    await settle();

    const prod = await program.account.product.fetch(productPda(legalId));
    assert.equal(prod.price.toNumber(), sol(0.02));
  });

  it("UPDATE: otro usuario no puede editar", async () => {
    await expectFail(
      program.methods
        .updateProduct({
          description: "hack",
          price: new BN(1),
          stock: 99,
          active: true,
          dropZone: "",
        })
        .accounts({ product: productPda(legalId), seller: buyer.publicKey })
        .signers([buyer])
        .rpc(),
      "un no-vendedor no debe editar"
    );
  });

  it("BUY: compra legal genera ticket y baja stock", async () => {
    const store = await program.account.store.fetch(storePda);
    const tid = store.ticketCount.toNumber();

    await program.methods
      .buyProduct(2)
      .accounts({
        store: storePda,
        product: productPda(legalId),
        ticket: ticketPda(tid),
        buyerProfile: profilePda(buyerName),
        authority: buyer.publicKey,
        seller,
        systemProgram: sys,
      })
      .signers([buyer])
      .rpc();
    await settle();

    const ticket = await program.account.ticket.fetch(ticketPda(tid));
    const prod = await program.account.product.fetch(productPda(legalId));
    assert.equal(ticket.quantity, 2);
    assert.equal(ticket.total.toNumber(), 2 * sol(0.02));
    assert.ok(!ticket.isIllegal);
    assert.equal(prod.stock, 1);
  });

  it("BUY: compra ilegal incluye aviso de zona alejada", async () => {
    const store = await program.account.store.fetch(storePda);
    const tid = store.ticketCount.toNumber();

    await program.methods
      .buyProduct(1)
      .accounts({
        store: storePda,
        product: productPda(illegalId),
        ticket: ticketPda(tid),
        buyerProfile: profilePda(buyerName),
        authority: buyer.publicKey,
        seller,
        systemProgram: sys,
      })
      .signers([buyer])
      .rpc();
    await settle();

    const ticket = await program.account.ticket.fetch(ticketPda(tid));
    assert.ok(ticket.isIllegal);
    assert.ok(ticket.notice.includes("terreno lejos de las zonas urbanas"));
    assert.ok(ticket.notice.includes("Cercanias de Antigua Tepic, Sector 21"));
  });

  it("BUY: sin stock suficiente falla", async () => {
    const store = await program.account.store.fetch(storePda);
    const tid = store.ticketCount.toNumber();

    await expectFail(
      program.methods
        .buyProduct(5)
        .accounts({
          store: storePda,
          product: productPda(legalId),
          ticket: ticketPda(tid),
          buyerProfile: profilePda(buyerName),
          authority: buyer.publicKey,
          seller,
          systemProgram: sys,
        })
        .signers([buyer])
        .rpc(),
      "debio fallar por stock"
    );
  });

  it("WALLET: cambia la wallet del perfil (firman ambas)", async () => {
    await program.methods
      .changeWallet()
      .accounts({
        profile: profilePda(buyerName),
        authority: buyer.publicKey,
        newAuthority: newWallet.publicKey,
      })
      .signers([buyer, newWallet])
      .rpc();
    await settle();

    const p = await program.account.profile.fetch(profilePda(buyerName));
    assert.ok(p.authority.equals(newWallet.publicKey));
  });

  it("DELETE: el vendedor elimina su producto", async () => {
    await program.methods
      .deleteProduct()
      .accounts({ product: productPda(legalId), seller })
      .rpc();
    await settle();

    const gone = await program.account.product.fetchNullable(
      productPda(legalId)
    );
    assert.strictEqual(gone, null);
  });
});
