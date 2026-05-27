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
        $id = $request->input('id');
        if($id){
            $borrower = Borrower::with(['references', 'identification'])->find($id);
        }
        return Inertia::render('User/Verification/Index',[
            'borrower' => $borrower
        ]);
    }

}
