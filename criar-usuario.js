require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const readline = require('readline');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Nome de Usuário: ', (usuario) => {
    rl.question('Senha: ', async (senha) => {
        console.log("\n⏳ Processando...");

        try {
            const salt = await bcrypt.genSalt(10);
            const senhaHash = await bcrypt.hash(senha, salt);

            const secret = speakeasy.generateSecret({ 
                name: `Painel Prazos (${usuario})`,
                issuer: "PainelPrazos"
            });

            const { error } = await supabase
                .from('usuarios')
                .insert([{ usuario: usuario, senha_hash: senhaHash, secret_2fa: secret.base32 }]);

            if (error) {
                console.error("\n❌ Erro ao salvar no banco:", error.message);
                if (error.code === '23505') console.log("   -> Esse nome de usuário já existe.");
            } else {
                console.log("\n✅ Usuário criado com sucesso!");
                console.log("--------------------------------------------------");
                
                qrcode.toString(secret.otpauth_url, { type: 'terminal', small: true }, (err, url) => {
                    if (err) return console.error(err);
                    console.log(url);
                });
            }

        } catch (err) {
            console.error("Erro inesperado:", err);
        } finally {
            rl.close();
        }
    });
});