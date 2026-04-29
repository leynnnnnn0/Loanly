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
        Schema::create('loans', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->foreignId('borrower_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->string('interest_type');
            $table->decimal('interest_value', 15, 2)->default(0);
            $table->string('interest_period');
            $table->integer('loan_duration');
            $table->string('duration_unit');
            $table->date('transaction_date');
            $table->string('reason');
            $table->string('payment_frequency');
            $table->boolean('is_voided')->default(false);
            $table->timestamp('voided_at')->nullable();
            $table->text('void_reason')->nullable();
            $table->string('status')->default('pending');
            $table->double('max_amount_to_borrow')->default(20000);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('loans');
    }
};
