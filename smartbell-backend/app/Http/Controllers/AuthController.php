<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Admin;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $email = $request->email;
        $password = $request->password;

        $mailcowHost = env('MAILCOW_HOST');
        $protocol = env('MAILCOW_API_PROTOCOL', 'https');
        $apiKey = env('MAILCOW_API_KEY');

        if (!$mailcowHost || !$apiKey) {
            return response()->json(['message' => 'Mailcow configuration is missing'], 500);
        }

        // 1. Authenticate via IMAP (Raw Socket since php-imap extension is missing)
        $fp = @fsockopen("tls://{$mailcowHost}", 993, $errno, $errstr, 5);
        if (!$fp) {
            Log::error("Mailcow IMAP Connection failed: $errstr ($errno)");
            return response()->json(['message' => 'Login server unreachable'], 500);
        }

        fgets($fp); // Read greeting
        // Escape quotes just in case
        $safeEmail = str_replace('"', '\"', $email);
        $safePass = str_replace('"', '\"', $password);
        
        fwrite($fp, "A001 LOGIN \"$safeEmail\" \"$safePass\"\r\n");
        
        $loginSuccess = false;
        while ($response = fgets($fp)) {
            if (strpos($response, 'A001 OK') !== false) {
                $loginSuccess = true;
                break;
            } elseif (strpos($response, 'A001 NO') !== false || strpos($response, 'A001 BAD') !== false) {
                break;
            }
        }

        fwrite($fp, "A002 LOGOUT\r\n");
        fclose($fp);

        if (!$loginSuccess) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }

        // 2. Verified via IMAP, now fetch roles via Mailcow API
        $apiUrl = "{$protocol}://{$mailcowHost}/api/v1/get/mailbox/{$email}";
        $apiResponse = Http::withHeaders([
            'X-API-Key' => $apiKey
        ])->get($apiUrl);

        if (!$apiResponse->successful() || empty($apiResponse->json())) {
            return response()->json(['message' => 'Failed to fetch user roles from Mailcow'], 500);
        }

        $mailboxData = $apiResponse->json();
        $tags = $mailboxData['tags'] ?? [];

        // 3. Authorization Check
        $allowedTags = ['Admin', 'TU', 'Guru'];
        if (empty(array_intersect($allowedTags, $tags))) {
            return response()->json([
                'message' => 'Access Denied: You must have the Admin, TU, or Guru tag in Mailcow to login.'
            ], 403);
        }

        // 4. Sync local Admin
        $admin = Admin::updateOrCreate(
            ['email' => $email],
            [
                'name' => $mailboxData['name'] ?: explode('@', $email)[0],
                'password' => bcrypt(Str::random(32)) // Dummy password, never used local
            ]
        );

        $token = $admin->createToken('admin_auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
