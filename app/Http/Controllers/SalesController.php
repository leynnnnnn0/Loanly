<?php

namespace App\Http\Controllers;

use App\Services\Reports\SalesReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalesController extends Controller
{
    public function index(Request $request, SalesReportService $sales)
    {
        $from = $request->input('from', now()->startOfYear()->toDateString());
        $to = $request->input('to', now()->toDateString());

        return Inertia::render('Admin/Sales/Index', $sales->data($from, $to));
    }
}
