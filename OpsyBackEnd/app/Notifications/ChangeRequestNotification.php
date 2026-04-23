<?php

namespace App\Notifications;

use App\Support\OutboundMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Str;

class ChangeRequestNotification extends Notification
{
    use Queueable;

    private $message;

    private $link;

    public function __construct($message, $link)
    {
        $this->message = $message;
        $this->link = $link;
    }

    public function via(object $notifiable): array
    {
        $channels = ['database'];
        if (! empty($notifiable->google_email) && OutboundMail::isReady()) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'link' => $this->link,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $base = rtrim((string) config('services.frontend_url', config('app.url')), '/');
        $path = ltrim((string) $this->link, '/');
        $url = $base.'/'.$path;

        return (new MailMessage)
            ->subject('ChangeHub — '.Str::limit(strip_tags($this->message), 72))
            ->greeting('Bonjour '.$notifiable->name.',')
            ->line($this->message)
            ->action('Ouvrir dans ChangeHub', $url)
            ->salutation('— ChangeHub');
    }
}
