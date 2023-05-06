<?php

use App\Controllers\AdminController;
use App\Controllers\AuthenticationController;
use App\Controllers\HomeController;
use App\Controllers\InitController;
use App\Controllers\UsersController;
use App\Controllers\WikiController;

return [
    [
        "route" => "/",
        "controller" => HomeController::class,
        "function" => "index",
    ],
    [
        "route" => "/api/entry/view",
        "controller" => WikiController::class,
        "function" => "loadEntry",
    ],
    [
        "route" => "/api/nav",
        "controller" => HomeController::class,
        "function" => "loadNav"
    ],
    [
        "route" => "/api/admin/entry/rename",
        "function" => "rename",
        "controller" => AdminController::class,
    ],
    [
        "route" => "/api/admin/entry/add",
        "controller" => AdminController::class,
        "function" => "add"
    ],
    [
        "route" => "/api/admin/entry/edit",
        "controller" => AdminController::class,
        "function" => "edit"
    ],
    [
        "route" => "/api/admin/entry/delete",
        "controller" => AdminController::class,
        "function" => "delete"
    ],
    [
        "route" => "/api/admin/users/list",
        "min_role" => "Editor",
        "controller" => UsersController::class,
        "function" => "list"
    ],
    [
        "route" => "/api/admin/users/add",
        "min_role" => "Editor",
        "controller" => UsersController::class,
        "function" => "add"
    ],
    [
        "route" => "/api/login",
        "controller" => AuthenticationController::class,
        "function" => "login"
    ],
    [
        "route" => "/api/change-password",
        "controller" => AuthenticationController::class,
        "function" => "changePassword"
    ],
    [
        "route" => "/api/auth/create-admin",
        "controller" => AuthenticationController::class,
        "function" => 'createAdmin',
    ],
    [
        "route" => "/api/init",
        "controller" => InitController::class,
        "function" => "init",
    ],
];