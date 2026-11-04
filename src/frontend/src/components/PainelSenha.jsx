import { KeyRound, ShieldCheck, UserCheck } from "lucide-react";
import RightPanel from "./RightPanel";

const features = [
  { icon: UserCheck, title: "Peça a redefinição", desc: "Informe o e-mail da sua conta." },
  { icon: KeyRound, title: "Receba o código", desc: "O administrador gera um código e passa para você." },
  { icon: ShieldCheck, title: "Crie a senha nova", desc: "O código vale por 30 minutos e serve uma única vez." },
];

// Painel das telas de redefinição de senha, explicando o passo a passo.
export default function PainelSenha() {
  return (
    <RightPanel
      heading="Recupere o acesso à sua conta."
      sub="A troca de senha passa pelo administrador da TrocaTicket, para manter sua conta protegida."
      features={features}
      highlight={{ title: "Seu código é pessoal", desc: "Não compartilhe o código com outras pessoas." }}
    />
  );
}
