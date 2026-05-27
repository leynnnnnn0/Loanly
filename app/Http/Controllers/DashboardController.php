<?php

namespace App\Http\Controllers;

use App\Services\Reports\AdminDashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(AdminDashboardService $dashboard)
    {
        return Inertia::render('Admin/Dashboard/Index', $dashboard->data());
    }
}
