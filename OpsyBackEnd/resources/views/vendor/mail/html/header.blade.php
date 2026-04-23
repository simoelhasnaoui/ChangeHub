@props(['url', 'logoSrc' => null])
@php
    $logoPath = public_path('images/changehub-mail-logo.png');
@endphp
<tr>
<td class="header">
<a href="{{ $url }}" style="display: inline-block; text-decoration: none;">
@if (! empty($logoSrc))
<img src="{{ $logoSrc }}" alt="{{ config('app.name') }}" style="height: 48px; width: auto; max-width: 260px; display: block; margin: 0 auto; border: 0; outline: none;">
@elseif (is_file($logoPath))
<img src="{{ asset('images/changehub-mail-logo.png') }}" alt="{{ config('app.name') }}" style="height: 48px; width: auto; max-width: 260px; display: block; margin: 0 auto; border: 0; outline: none;">
@else
<span style="font-size: 22px; font-weight: 700; color: #6b5393; letter-spacing: -0.02em;">{{ config('app.name') }}</span>
@endif
</a>
</td>
</tr>
