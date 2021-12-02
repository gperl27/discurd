<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class ServerUserController extends Controller
{
    public function leave(Server $server)
    {
        $server->users()->detach([Auth::user()->id]);
        return true;
        // return Redirect::route('servers.show', ['server' => $server->id]);
    }
}
