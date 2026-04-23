<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('change_request_repo_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('change_request_id')->constrained()->cascadeOnDelete();
            $table->string('repo_full_name'); // "owner/name"
            $table->timestamps();

            $table->unique('change_request_id');
            $table->index('repo_full_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('change_request_repo_links');
    }
};

