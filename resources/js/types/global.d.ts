import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

if (typeof window !== 'undefined') {
    window.Pusher = Pusher;

   const token = document.cookie
       .split('; ')
       .find((row) => row.startsWith('XSRF-TOKEN='))
       ?.substring('XSRF-TOKEN='.length);

   window.Echo = new Echo({
       broadcaster: 'pusher',
       key: import.meta.env.VITE_PUSHER_APP_KEY as string,
       cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER as string,
       forceTLS: true,
       authEndpoint: '/broadcasting/auth',
       auth: {
           headers: {
               'X-XSRF-TeOKEN': decodeURIComponent(token ?? ''),
           },
       },
   });
}
