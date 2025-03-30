// import { History } from "@/components/custom/history";
// import { auth } from "@/app/(auth)/auth";
// import { useEffect, useState } from "react";
// import { Session } from "next-auth";

// export const Page = () => {
//     const [session, setSession] = useState<Session | null>(null);

//     useEffect(() => {
//         const fetchSession = async () => {
//             const userSession = await auth();
//             setSession(userSession ?? null);
//         };

//         fetchSession();
//     }, []);

//     return (
//         <div>
//             {session ? (
//                 <div>Hello, {session.user?.name || 'Guest'}</div>
//             ) : (
//                 <div>Loading...</div>
//             )}
//         </div>
//     );
// };
