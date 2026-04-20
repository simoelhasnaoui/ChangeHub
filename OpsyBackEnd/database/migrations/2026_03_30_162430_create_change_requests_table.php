<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('change_requests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignId('change_type_id')->constrained()->restrictOnDelete();
            $table->string('affected_system');
            $table->date('planned_date');
            $table->enum('risk_level', ['low', 'medium', 'high']);
            $table->enum('status', [
                'draft', 'pending_approval', 'approved',
                'in_progress', 'done', 'rejected'
            ])->default('draft');
            $table->foreignId('requester_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('implementer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('change_requests');
    }
};
