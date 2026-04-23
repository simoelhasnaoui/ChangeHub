@php
    $changehubMailLogoEmbed = null;
    if (isset($message) && is_file($path = public_path('images/changehub-mail-logo.png'))) {
        $changehubMailLogoEmbed = $message->embed($path);
    }
@endphp
<x-mail::message :logo-embed-url="$changehubMailLogoEmbed">
{{-- Greeting --}}
@if (! empty($greeting))
# {{ $greeting }}
@else
@if ($level === 'error')
# Oups !
@else
# Bonjour !
@endif
@endif

{{-- Intro Lines --}}
@foreach ($introLines as $line)
{{ $line }}

@endforeach

{{-- Action Button --}}
@isset($actionText)
<?php
    $color = match ($level) {
        'success', 'error' => $level,
        default => 'primary',
    };
?>
<x-mail::button :url="$actionUrl" :color="$color">
{{ $actionText }}
</x-mail::button>
@endisset

{{-- Outro Lines --}}
@foreach ($outroLines as $line)
{{ $line }}

@endforeach

{{-- Salutation --}}
@if (! empty($salutation))
{{ $salutation }}
@else
Cordialement,<br>
{{ config('app.name') }}
@endif

{{-- Subcopy --}}
@isset($actionText)
<x-slot:subcopy>
Si le bouton « {{ $actionText }} » ne fonctionne pas, copiez-collez l’adresse ci-dessous dans votre navigateur :

<span class="break-all">[{{ $displayableActionUrl }}]({{ $actionUrl }})</span>
</x-slot:subcopy>
@endisset
</x-mail::message>
