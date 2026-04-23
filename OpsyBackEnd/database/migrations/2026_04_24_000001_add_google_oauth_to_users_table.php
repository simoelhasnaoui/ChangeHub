<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->after('github_connected_at');
            $table->string('google_email')->nullable()->after('google_id');
            $table->text('google_refresh_token')->nullable()->after('google_email');
            $table->timestamp('google_connected_at')->nullable()->after('google_refresh_token');
            $table->unique('google_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['google_id']);
            $table->dropColumn([
                'google_id',
                'google_email',
                'google_refresh_token',
                'google_connected_at',
            ]);
        });
    }
};
