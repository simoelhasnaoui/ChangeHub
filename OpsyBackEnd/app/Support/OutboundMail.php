<?php

namespace App\Support;

/**
 * Whether Laravel is configured to send mail outside the app (not log/array only).
 */
final class OutboundMail
{
    public static function isReady(): bool
    {
        $m = (string) config('mail.default');

        return ! in_array($m, ['log', 'array'], true);
    }
}
