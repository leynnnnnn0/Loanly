<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Borrower;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        $borrower = null;

        if ($request->filled('id')) {
            $borrower = Borrower::with(['references', 'identification'])
                ->where('user_id', $request->user()?->id)
                ->find($request->input('id'));
        }

        return Inertia::render('User/Verification/Index', [
            'borrower' => $borrower,
        ]);
    }
}
