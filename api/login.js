export default function handler(req, res) {
    // Só aceita POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { senha } = req.body;
    const systemPass = process.env.SENHA_DO_SISTEMA;

    // --- ÁREA DE DEBUG (RAIO-X) ---
    console.log("========================================");
    console.log("TESTE DE LOGIN INICIADO");
    console.log("Senha que chegou do site:", `"${senha}"`); // As aspas mostram se tem espaço
    console.log("Senha salva na Vercel:", `"${systemPass}"`); // As aspas mostram se tem espaço
    
    if (!systemPass) {
        console.error("ERRO GRAVE: A variável SENHA_DO_SISTEMA está vazia ou não existe!");
    } else if (senha === systemPass) {
        console.log("SUCESSO: As senhas batem!");
    } else {
        console.log("FALHA: As senhas são diferentes.");
    }
    console.log("========================================");
    // ----------------------------------

    if (senha === systemPass) {
        return res.status(200).json({ autorizado: true });
    } else {
        return res.status(401).json({ autorizado: false });
    }
}