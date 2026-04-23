<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <title>Réinitialisation — ChangeHub</title>
</head>
<body style="margin:0;padding:24px;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#1a1625;background:#f4f2f8;">
    <p style="margin:0 0 12px;">Bonjour {{ $userName }},</p>
    <p style="margin:0 0 16px;">Vous avez demandé à réinitialiser votre mot de passe ChangeHub. Cliquez sur le lien ci-dessous (valide {{ $expiresMinutes }} minutes) :</p>
    <p style="margin:0 0 24px;">
        <a href="{{ $resetUrl }}" style="display:inline-block;padding:12px 20px;background:#6b5393;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Choisir un nouveau mot de passe</a>
    </p>
    <p style="margin:0;font-size:12px;color:#6b6578;">Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p>
</body>
</html>
