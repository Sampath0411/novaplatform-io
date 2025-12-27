import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const TELEGRAM_CHAT_ID = Deno.env.get('TELEGRAM_CHAT_ID');

interface UploadRequest {
  action: 'upload';
  fileBase64: string;
  fileName: string;
  fileType: string;
}

interface GetFileRequest {
  action: 'getFile';
  fileId: string;
}

type RequestBody = UploadRequest | GetFileRequest;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error('Telegram credentials not configured');
    }

    const body: RequestBody = await req.json();

    if (body.action === 'upload') {
      // Decode base64 file
      const binaryString = atob(body.fileBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Create form data for Telegram
      const formData = new FormData();
      const blob = new Blob([bytes], { type: body.fileType });
      formData.append('chat_id', TELEGRAM_CHAT_ID);
      formData.append('document', blob, body.fileName);

      console.log(`Uploading file: ${body.fileName} to Telegram`);

      // Send file to Telegram
      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const telegramResult = await telegramResponse.json();

      if (!telegramResult.ok) {
        console.error('Telegram upload error:', telegramResult);
        throw new Error(telegramResult.description || 'Failed to upload to Telegram');
      }

      const fileId = telegramResult.result.document.file_id;
      console.log(`File uploaded successfully. File ID: ${fileId}`);

      return new Response(
        JSON.stringify({
          success: true,
          fileId: fileId,
          fileName: body.fileName,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    if (body.action === 'getFile') {
      // Get file path from Telegram
      const fileInfoResponse = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${body.fileId}`
      );

      const fileInfo = await fileInfoResponse.json();

      if (!fileInfo.ok) {
        throw new Error(fileInfo.description || 'Failed to get file info');
      }

      const filePath = fileInfo.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${filePath}`;

      console.log(`File download URL generated for file_id: ${body.fileId}`);

      return new Response(
        JSON.stringify({
          success: true,
          downloadUrl: downloadUrl,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    throw new Error('Invalid action');
  } catch (error: any) {
    console.error('Telegram storage error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});
