export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { senha } = req.body;
    const systemPass = process.env.SENHA_DO_SISTEMA;

    if (senha === systemPass) {
        return res.status(200).json({ autorizado: true });
    } else {
        return res.status(401).json({ autorizado: false });
    }
}