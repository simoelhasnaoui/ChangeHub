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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('force_password_change')->default(false)->after('password');
            $table->string('department')->nullable()->after('force_password_change');
            $table->string('job_title')->nullable()->after('department');
            $table->string('phone')->nullable()->after('job_title');
            $table->string('employee_id')->nullable()->after('phone');
            $table->enum('status', ['active', 'inactive'])->default('active')->after('employee_id');
            $table->string('avatar_path')->nullable()->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'force_password_change',
                'department',
                'job_title',
                'phone',
                'employee_id',
                'status',
                'avatar_path'
            ]);
        });
    }
};
