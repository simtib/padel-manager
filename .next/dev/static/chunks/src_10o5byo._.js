(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/app/join/[inviteCode]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JoinInvitePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PadelContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/PadelContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trophy.js [app-client] (ecmascript) <export default as Trophy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-client] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-right.js [app-client] (ecmascript) <export default as ArrowRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function JoinInviteContent({ inviteCode }) {
    _s();
    const { events, currentUser, joinEvent } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PadelContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePadel"])();
    const [joining, setJoining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [joinedMsg, setJoinedMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const event = events.find((e)=>e.id.toLowerCase().includes(inviteCode.toLowerCase()) || e.id === 'evt_dubai_championship_2026') || events[0];
    const isConfirmed = event?.participants.some((p)=>p.id === currentUser.id && p.status === 'confirmed');
    const isWaitingList = event?.participants.some((p)=>p.id === currentUser.id && p.status === 'waiting_list');
    const handleJoin = async ()=>{
        if (!event) return;
        setJoining(true);
        const res = await joinEvent(event.id);
        setJoining(false);
        if (res.success) {
            setJoinedMsg(res.status === 'confirmed' ? 'Joined successfully!' : 'Added to waiting list!');
            setTimeout(()=>{
                window.location.href = `/`;
            }, 1200);
        }
    };
    if (!event) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-slate-950 flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-md w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trophy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trophy$3e$__["Trophy"], {
                        className: "w-12 h-12 text-slate-600 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                        lineNumber: 37,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-xl font-bold text-white mb-2",
                        children: "Invalid Invite Link"
                    }, void 0, false, {
                        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                        lineNumber: 38,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mb-6",
                        children: "The tournament invitation code was not found or has expired."
                    }, void 0, false, {
                        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                        lineNumber: 39,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/",
                        className: "bg-emerald-500 text-slate-950 font-bold text-xs py-3 px-6 rounded-xl inline-block",
                        children: "Go to Platform"
                    }, void 0, false, {
                        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                        lineNumber: 40,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-slate-950 flex items-center justify-center p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 53,
                                    columnNumber: 13
                                }, this),
                                " Private Tournament Invitation"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-2xl font-black text-white font-display leading-tight",
                            children: event.name
                        }, void 0, false, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 55,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-slate-400",
                            children: [
                                "Organized by ",
                                event.ownerName
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 56,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-slate-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-2 text-slate-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                            className: "w-4 h-4 text-emerald-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                            lineNumber: 62,
                                            columnNumber: 15
                                        }, this),
                                        " Date & Time"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-white",
                                    children: [
                                        event.date,
                                        " at ",
                                        event.startTime
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 64,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-slate-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-2 text-slate-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                            className: "w-4 h-4 text-emerald-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                            lineNumber: 69,
                                            columnNumber: 15
                                        }, this),
                                        " Venue"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 68,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-white",
                                    children: event.facilityName
                                }, void 0, false, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between text-slate-300",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "flex items-center gap-2 text-slate-400",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                            className: "w-4 h-4 text-emerald-400"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                            lineNumber: 76,
                                            columnNumber: 15
                                        }, this),
                                        " Registration"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 75,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-bold text-white",
                                    children: [
                                        event.participants.filter((p)=>p.status === 'confirmed').length,
                                        " / ",
                                        event.maxPlayers,
                                        " Players"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                                    lineNumber: 78,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                joinedMsg ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs p-4 rounded-2xl text-center",
                    children: joinedMsg
                }, void 0, false, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 85,
                    columnNumber: 11
                }, this) : isConfirmed ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold text-xs p-4 rounded-2xl text-center",
                    children: "You are already registered for this tournament!"
                }, void 0, false, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 89,
                    columnNumber: 11
                }, this) : isWaitingList ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs p-4 rounded-2xl text-center",
                    children: "You are currently on the waiting list for this tournament."
                }, void 0, false, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 93,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: handleJoin,
                    disabled: joining,
                    className: "w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-50",
                    children: [
                        joining ? 'Joining...' : 'Confirm Registration',
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowRight$3e$__["ArrowRight"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                            lineNumber: 103,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
                    lineNumber: 97,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
_s(JoinInviteContent, "cb9TOj905lIVUS20bomaZoucDdY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PadelContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePadel"]
    ];
});
_c = JoinInviteContent;
function JoinInvitePage({ params }) {
    const code = params?.inviteCode || 'ABC123';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$PadelContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PadelProvider"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(JoinInviteContent, {
            inviteCode: code
        }, void 0, false, {
            fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
            lineNumber: 115,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/join/[inviteCode]/page.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_c1 = JoinInvitePage;
var _c, _c1;
__turbopack_context__.k.register(_c, "JoinInviteContent");
__turbopack_context__.k.register(_c1, "JoinInvitePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/PadelContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PadelProvider",
    ()=>PadelProvider,
    "usePadel",
    ()=>usePadel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$seedData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/data/seedData.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/utils/engine.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$teams$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/teams.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$groups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/groups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$scheduling$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/scheduling.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$knockout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/knockout.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$standings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/standings.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$playerStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/playerStats.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/contextHelpers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$usePadelPersistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/usePadelPersistence.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/authProfile.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseAuthSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/useSupabaseAuthSync.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseEventSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/useSupabaseEventSync.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
;
;
// The app's seed/localStorage data uses human-readable string IDs (e.g. 'fac_1',
// 'c1'), but the Supabase schema stores facilities/courts/events ids as UUIDs.
// This guard prevents pushing those client string IDs into UUID columns, which
// would fail with an invalid-UUID / foreign-key violation.
const PadelContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const SEED_PARTNER_REQUESTS = [];
const SEED_NOTIFICATIONS = [];
const PadelProvider = ({ children })=>{
    _s();
    const [allPlayers, setAllPlayers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$seedData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEED_PLAYERS"]);
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$seedData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEED_PLAYERS"][0]);
    const [isAuthenticated, setIsAuthenticated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [facilities, setFacilities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [playerGroups, setPlayerGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [partnerRequests, setPartnerRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(SEED_PARTNER_REQUESTS);
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(SEED_NOTIFICATIONS);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$usePadelPersistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePadelPersistence"])({
        allPlayers,
        setAllPlayers,
        currentUser,
        setCurrentUser,
        facilities,
        setFacilities,
        events,
        setEvents,
        playerGroups,
        setPlayerGroups,
        partnerRequests,
        setPartnerRequests
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseAuthSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSupabaseAuthSync"])({
        setIsAuthenticated,
        setCurrentUser,
        setAllPlayers
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseEventSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSupabaseEventSync"])(isAuthenticated, setEvents);
    const reportOperationError = (title, error)=>{
        const message = error instanceof Error ? error.message : String(error || 'Unexpected error');
        setNotifications((previous)=>[
                {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])('error'),
                    userId: currentUser.id,
                    title,
                    message,
                    date: new Date().toISOString(),
                    read: false
                },
                ...previous
            ]);
    };
    const clearNotifications = ()=>{
        setNotifications((previous)=>previous.filter((notification)=>notification.userId !== currentUser.id));
    };
    // Supabase Auth Action Implementations
    const signUpAction = async (data)=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const siteUrl = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || window.location.origin;
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    emailRedirectTo: `${siteUrl}/auth/confirm`,
                    data: {
                        first_name: data.firstName,
                        last_name: data.lastName,
                        display_name: `${data.firstName} ${data.lastName}`
                    }
                }
            });
            if (authError) {
                console.error('Supabase signup failed:', authError);
                return {
                    success: false,
                    error: authError.message
                };
            }
            // If session is present immediately (e.g. email confirmation disabled), handle profile
            if (authData.session && authData.user) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureProfile"])(supabase, authData.user);
                const newPlayer = {
                    id: authData.user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    displayName: `${data.firstName} ${data.lastName}`,
                    email: data.email,
                    avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
                    createdAt: new Date().toISOString(),
                    eventsPlayed: 0,
                    matchesPlayed: 0,
                    matchesWon: 0,
                    matchesLost: 0,
                    winRate: 0,
                    totalGamesWon: 0,
                    totalGamesLost: 0,
                    recentEvents: []
                };
                setAllPlayers((prev)=>[
                        ...prev,
                        newPlayer
                    ]);
                setCurrentUser(newPlayer);
            }
            return {
                success: true
            };
        } catch (err) {
            console.error('Supabase signup exception:', err?.name || 'unknown_error', err?.message || 'no message');
            return {
                success: false,
                error: err.message || 'Failed to create account'
            };
        }
    };
    const loginAction = async (email, password)=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (authError) {
                console.error('Supabase login failed:', authError);
                return {
                    success: false,
                    error: authError.message
                };
            }
            if (authData.user) {
                let profile = null;
                try {
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureProfile"])(supabase, authData.user);
                    const { data, error: profileError } = await supabase.from('profiles').select('*').eq('id', authData.user.id).maybeSingle();
                    if (profileError) throw profileError;
                    profile = data;
                } catch (profileError) {
                    // Authentication succeeded. Allow the user to continue with their
                    // auth metadata if the optional profile sync is temporarily unavailable.
                    console.warn('Supabase profile sync failed after login:', profileError);
                }
                const newPlayer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toPlayerProfile"])(profile, authData.user);
                setAllPlayers((prev)=>{
                    if (prev.some((p)=>p.id === newPlayer.id)) return prev;
                    return [
                        newPlayer,
                        ...prev
                    ];
                });
                setCurrentUser(newPlayer);
            }
            return {
                success: true
            };
        } catch (err) {
            console.error('Supabase login exception:', err);
            return {
                success: false,
                error: err.message || 'Login failed'
            };
        }
    };
    const logoutAction = async ()=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            await supabase.auth.signOut();
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('padel_manager_v1_state_current_user');
            }
        } catch (err) {
            console.error('Logout error:', err);
        }
    };
    const forgotPasswordAction = async (email)=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (err) {
            return {
                success: true
            }; // Graceful simulation fallback
        }
    };
    const resetPasswordAction = async (password)=>{
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { error } = await supabase.auth.updateUser({
                password
            });
            if (error) return {
                success: false,
                error: error.message
            };
            return {
                success: true
            };
        } catch (err) {
            return {
                success: true
            };
        }
    };
    // Switch Active User / Persona
    const switchUser = (userId)=>{
        const target = allPlayers.find((p)=>p.id === userId);
        if (target) {
            setCurrentUser(target);
        }
    };
    const loginUser = (email)=>{
        const found = allPlayers.find((p)=>p.email.toLowerCase() === email.toLowerCase());
        if (found) {
            setCurrentUser(found);
            return true;
        }
        return false;
    };
    const registerUser = (firstName, lastName, email, mobile)=>{
        const newPlayer = {
            id: `usr_${Date.now()}`,
            firstName,
            lastName,
            displayName: `${firstName} ${lastName}`,
            email,
            mobileNumber: mobile || '',
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            createdAt: new Date().toISOString(),
            eventsPlayed: 0,
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            winRate: 0,
            totalGamesWon: 0,
            totalGamesLost: 0,
            recentEvents: []
        };
        setAllPlayers((prev)=>[
                newPlayer,
                ...prev
            ]);
        setCurrentUser(newPlayer);
    };
    const updateProfile = (data)=>{
        setCurrentUser((prev)=>{
            const updated = {
                ...prev,
                ...data
            };
            setAllPlayers((players)=>players.map((p)=>p.id === prev.id ? updated : p));
            return updated;
        });
    };
    const createEvent = async (newEventData)=>{
        const playerGroup = (newEventData.visibility || 'private') === 'private' ? playerGroups.find((group)=>group.id === newEventData.playerGroupId && (group.ownerId === currentUser.id || group.memberIds.includes(currentUser.id))) : undefined;
        if ((newEventData.visibility || 'private') === 'private' && !playerGroup) throw new Error('Select a player group for this private game.');
        let eventId = `evt_${Date.now()}`;
        let supabaseError;
        let creatorId = currentUser.id;
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const sb = supabase;
            const { data: { session } } = await sb.auth.getSession();
            const authUid = session?.user?.id;
            if (authUid) {
                creatorId = authUid;
                if (playerGroup && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(playerGroup.id)) throw new Error('This player group has not been saved. Create a saved group before creating the private game.');
                // Restored sessions may belong to accounts created before the profile
                // trigger existed. Repair the FK target before inserting the event.
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureProfile"])(supabase, session.user);
                const facility = facilities.find((f)=>f.id === newEventData.facilityId) || facilities[0];
                const courtIds = (newEventData.courtIds || []).filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"]);
                const coAdminIds = (newEventData.coAdminIds || []).filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"]);
                const { data: insertedEventId, error: eventError } = await sb.rpc('create_event', {
                    event_name: newEventData.name || 'New Padel Tournament',
                    event_description: newEventData.description || '',
                    event_type_value: newEventData.type || 'tournament',
                    event_date_value: newEventData.date || new Date().toISOString().split('T')[0],
                    start_time_value: newEventData.startTime || '18:00',
                    facility_id_value: facility && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(facility.id) ? facility.id : null,
                    visibility_value: newEventData.visibility || 'private',
                    player_group_id_value: playerGroup?.id || null,
                    max_players_value: newEventData.type === 'normal_match' ? 4 : newEventData.maxPlayers || 16,
                    court_ids: courtIds,
                    co_admin_ids: coAdminIds,
                    rules_value: {
                        ...newEventData.rules,
                        format: newEventData.format || (newEventData.type === 'normal_match' ? 'standard_3_sets' : 'custom')
                    }
                });
                if (eventError) {
                    reportOperationError('Could not create event', eventError.message);
                    supabaseError = eventError.message;
                } else if (insertedEventId) {
                    eventId = insertedEventId;
                }
            }
        } catch (err) {
            console.error('Supabase event exception:', err);
            supabaseError = err.message;
        }
        if (supabaseError) throw new Error(supabaseError);
        const facility = facilities.find((f)=>f.id === newEventData.facilityId) || facilities[0];
        const newEvent = {
            id: eventId,
            name: newEventData.name || 'New Padel Tournament',
            description: newEventData.description || '',
            type: newEventData.type || 'tournament',
            format: newEventData.format || (newEventData.type === 'normal_match' ? 'standard_3_sets' : 'custom'),
            date: newEventData.date || new Date().toISOString().split('T')[0],
            startTime: newEventData.startTime || '18:00',
            facilityId: facility?.id || '',
            facilityName: facility?.name || '',
            courtIds: newEventData.courtIds || [],
            ownerId: creatorId,
            ownerName: currentUser.displayName,
            coAdminIds: newEventData.coAdminIds || [],
            maxPlayers: newEventData.type === 'normal_match' ? 4 : newEventData.maxPlayers || 16,
            maxTeams: (newEventData.type === 'normal_match' ? 4 : newEventData.maxPlayers || 16) / 2,
            visibility: newEventData.visibility || 'private',
            playerGroupId: playerGroup?.id,
            status: 'open',
            participants: [
                {
                    id: creatorId,
                    displayName: currentUser.displayName,
                    isGuest: false,
                    registeredAt: new Date().toISOString(),
                    status: 'confirmed'
                }
            ],
            teams: [],
            groups: [],
            matches: [],
            rules: newEventData.rules || {
                winPoints: 3,
                drawPoints: 1,
                lossPoints: 0,
                tiebreakOrder: [
                    'points',
                    'matchesWon',
                    'scoreDiff',
                    'scoreFor'
                ],
                qualifiersPerGroup: 2
            },
            createdAt: new Date().toISOString()
        };
        setEvents((prev)=>[
                newEvent,
                ...prev
            ]);
        return eventId;
    };
    const updateEvent = async (eventId, changes)=>{
        const event = events.find((item)=>item.id === eventId);
        if (!event || event.ownerId !== currentUser.id && !event.coAdminIds.includes(currentUser.id)) {
            throw new Error('Only the organizer or a co-admin can edit this event.');
        }
        const format = changes.format || event.format || (event.type === 'normal_match' ? 'standard_3_sets' : 'custom');
        const type = format === 'standard_3_sets' ? 'normal_match' : 'tournament';
        const maxPlayers = type === 'normal_match' ? 4 : changes.maxPlayers;
        if (!changes.name.trim()) throw new Error('Enter an event name.');
        if (!Number.isInteger(maxPlayers) || maxPlayers < 4 || maxPlayers % 2 !== 0) throw new Error('Player capacity must be an even number of at least 4.');
        if (maxPlayers < event.participants.filter((p)=>p.status === 'confirmed').length) throw new Error('Remove confirmed players before reducing capacity below the current player count.');
        if (format !== (event.format || (event.type === 'normal_match' ? 'standard_3_sets' : 'custom')) && (event.teams.length || event.groups.length || event.matches.length || ![
            'draft',
            'open',
            'full'
        ].includes(event.status))) {
            throw new Error('Game format cannot change after teams or matches have been created.');
        }
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(eventId)) {
            const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { error } = await sb.rpc('update_event_settings', {
                target_event_id: eventId,
                event_name: changes.name.trim(),
                event_description: changes.description || '',
                format_value: format,
                event_date_value: changes.date,
                start_time_value: changes.startTime,
                visibility_value: changes.visibility,
                max_players_value: maxPlayers
            });
            if (error) throw new Error(error.message);
        }
        setEvents((previous)=>previous.map((item)=>item.id === eventId ? {
                    ...item,
                    ...changes,
                    name: changes.name.trim(),
                    format,
                    type,
                    maxPlayers,
                    maxTeams: maxPlayers / 2,
                    status: [
                        'open',
                        'full'
                    ].includes(item.status) ? item.participants.filter((p)=>p.status === 'confirmed').length >= maxPlayers ? 'full' : 'open' : item.status
                } : item));
    };
    const deleteEvent = async (eventId)=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(eventId)) {
            const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { data, error } = await sb.rpc('delete_event', {
                target_event_id: eventId
            });
            if (error || data !== true) {
                reportOperationError('Could not delete event', error?.message || 'Event was not deleted');
                return false;
            }
        }
        setEvents((prev)=>prev.filter((e)=>e.id !== eventId));
        return true;
    };
    const joinEvent = async (eventId, preferredPartnerId)=>{
        let resultStatus = 'confirmed';
        let usedServerStatus = false;
        let supabaseError;
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const sb = supabase;
            const { data: { session } } = await sb.auth.getSession();
            const authUid = session?.user?.id;
            if (authUid && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(eventId)) {
                const event = events.find((e)=>e.id === eventId);
                if (!event) {
                    return {
                        success: false,
                        status: resultStatus
                    };
                }
                // Capacity and duplicate checks must happen atomically in PostgreSQL;
                // a client-side count allows concurrent users to overbook an event.
                const { data: registrationStatus, error: participantError } = await sb.rpc('register_for_event', {
                    target_event_id: eventId
                });
                if (participantError) {
                    reportOperationError('Could not join event', participantError.message);
                    supabaseError = participantError.message;
                } else if (registrationStatus === 'confirmed' || registrationStatus === 'waiting_list') {
                    resultStatus = registrationStatus;
                    usedServerStatus = true;
                }
            }
        } catch (err) {
            console.error('Supabase join event exception:', err);
            supabaseError = err.message;
        }
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const exists = event.participants.some((p)=>p.id === currentUser.id);
                if (exists) {
                    const currentP = event.participants.find((p)=>p.id === currentUser.id);
                    if (currentP) resultStatus = currentP.status;
                    return {
                        ...event,
                        participants: event.participants.map((p)=>p.id === currentUser.id ? {
                                ...p,
                                preferredPartnerId
                            } : p)
                    };
                }
                const confirmedCount = event.participants.filter((p)=>p.status === 'confirmed').length;
                const isFull = usedServerStatus ? resultStatus === 'waiting_list' : confirmedCount >= event.maxPlayers;
                if (!usedServerStatus) resultStatus = isFull ? 'waiting_list' : 'confirmed';
                const newParticipant = {
                    id: currentUser.id,
                    displayName: currentUser.displayName,
                    isGuest: false,
                    registeredAt: new Date().toISOString(),
                    status: resultStatus,
                    waitingListPosition: isFull ? event.participants.filter((p)=>p.status === 'waiting_list').length + 1 : undefined,
                    preferredPartnerId
                };
                const updatedParticipants = [
                    ...event.participants,
                    newParticipant
                ];
                const confirmedList = updatedParticipants.filter((p)=>p.status === 'confirmed');
                const newConfirmedCount = confirmedList.length;
                let newStatus = !isFull && newConfirmedCount >= event.maxPlayers ? 'full' : event.status;
                let updatedTeams = event.teams;
                let updatedMatches = event.matches;
                if (event.type === 'normal_match') {
                    if (newConfirmedCount === 4) {
                        newStatus = 'in_progress';
                        const t1Id = `team_nm_${eventId}_1`;
                        const t2Id = `team_nm_${eventId}_2`;
                        updatedTeams = [
                            {
                                id: t1Id,
                                eventId: event.id,
                                name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
                                player1: {
                                    id: confirmedList[0].id,
                                    displayName: confirmedList[0].displayName,
                                    isGuest: confirmedList[0].isGuest
                                },
                                player2: {
                                    id: confirmedList[1].id,
                                    displayName: confirmedList[1].displayName,
                                    isGuest: confirmedList[1].isGuest
                                },
                                locked: true
                            },
                            {
                                id: t2Id,
                                eventId: event.id,
                                name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
                                player1: {
                                    id: confirmedList[2].id,
                                    displayName: confirmedList[2].displayName,
                                    isGuest: confirmedList[2].isGuest
                                },
                                player2: {
                                    id: confirmedList[3].id,
                                    displayName: confirmedList[3].displayName,
                                    isGuest: confirmedList[3].isGuest
                                },
                                locked: true
                            }
                        ];
                        updatedMatches = [
                            {
                                id: `match_nm_${eventId}_1`,
                                eventId: event.id,
                                stage: 'group',
                                round: 1,
                                courtId: event.courtIds[0] || 'c1',
                                courtName: 'Court 1',
                                team1Id: t1Id,
                                team2Id: t2Id,
                                status: 'in_progress'
                            }
                        ];
                    }
                }
                return {
                    ...event,
                    status: newStatus,
                    participants: updatedParticipants,
                    teams: updatedTeams,
                    matches: updatedMatches
                };
            }));
        return {
            success: true,
            status: resultStatus
        };
    };
    const removeParticipant = (eventId, targetUserId)=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(eventId) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(targetUserId)) {
            const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            void sb.rpc('remove_event_participant', {
                target_event_id: eventId,
                target_user_id: targetUserId
            }).then(({ error })=>{
                if (error) reportOperationError('Could not remove participant', error.message);
            });
        }
        // Clear partner requests involving this participant for this event
        setPartnerRequests((prev)=>prev.filter((r)=>!(r.eventId === eventId && (r.fromUserId === targetUserId || r.toUserId === targetUserId))));
        // Notifications are deliberately created outside the state updater. React
        // may invoke updater callbacks more than once in development Strict Mode.
        const eventSnapshot = events.find((event)=>event.id === eventId);
        const leavingSnapshot = eventSnapshot?.participants.find((participant)=>participant.id === targetUserId);
        if (eventSnapshot && leavingSnapshot) {
            if (!leavingSnapshot.isGuest) {
                setNotifications((previous)=>[
                        {
                            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])('notif_wdr'),
                            userId: targetUserId,
                            title: 'Registration Withdrawn',
                            message: `You have successfully withdrawn your registration from "${eventSnapshot.name}".`,
                            date: new Date().toISOString(),
                            read: false,
                            eventId
                        },
                        ...previous
                    ]);
            }
            if (leavingSnapshot.status === 'confirmed') {
                const promoted = eventSnapshot.participants.find((participant)=>participant.id !== targetUserId && participant.status === 'waiting_list');
                if (promoted) {
                    setNotifications((previous)=>[
                            {
                                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])('notif_promoted'),
                                userId: promoted.id,
                                title: 'Promoted from Waiting List!',
                                message: `A spot opened up in ${eventSnapshot.name}! You are now confirmed.`,
                                date: new Date().toISOString(),
                                read: false,
                                eventId
                            },
                            ...previous
                        ]);
                }
            }
        }
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const leaving = event.participants.find((p)=>p.id === targetUserId);
                if (!leaving) return event;
                let updatedParticipants = event.participants.filter((p)=>p.id !== targetUserId);
                // If a confirmed player left, promote the #1 waiting list player
                if (leaving.status === 'confirmed') {
                    const firstWaiting = updatedParticipants.find((p)=>p.status === 'waiting_list');
                    if (firstWaiting) {
                        updatedParticipants = updatedParticipants.map((p)=>{
                            if (p.id === firstWaiting.id) {
                                return {
                                    ...p,
                                    status: 'confirmed',
                                    waitingListPosition: undefined
                                };
                            }
                            if (p.status === 'waiting_list' && p.waitingListPosition) {
                                return {
                                    ...p,
                                    waitingListPosition: p.waitingListPosition - 1
                                };
                            }
                            return p;
                        });
                    }
                } else if (leaving.status === 'waiting_list' && leaving.waitingListPosition) {
                    const pos = leaving.waitingListPosition;
                    updatedParticipants = updatedParticipants.map((p)=>{
                        if (p.status === 'waiting_list' && p.waitingListPosition && p.waitingListPosition > pos) {
                            return {
                                ...p,
                                waitingListPosition: p.waitingListPosition - 1
                            };
                        }
                        return p;
                    });
                }
                // Clean up teams if player was in a team
                let updatedTeams = event.teams.filter((t)=>t.player1?.id !== targetUserId && t.player2?.id !== targetUserId);
                let updatedMatches = event.matches;
                if (event.type === 'normal_match') {
                    const confirmedList = updatedParticipants.filter((p)=>p.status === 'confirmed');
                    if (confirmedList.length < 4) {
                        updatedTeams = [];
                        updatedMatches = [];
                    } else if (confirmedList.length === 4) {
                        const t1Id = `team_nm_${event.id}_1`;
                        const t2Id = `team_nm_${event.id}_2`;
                        updatedTeams = [
                            {
                                id: t1Id,
                                eventId: event.id,
                                name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
                                player1: {
                                    id: confirmedList[0].id,
                                    displayName: confirmedList[0].displayName,
                                    isGuest: confirmedList[0].isGuest
                                },
                                player2: {
                                    id: confirmedList[1].id,
                                    displayName: confirmedList[1].displayName,
                                    isGuest: confirmedList[1].isGuest
                                },
                                locked: true
                            },
                            {
                                id: t2Id,
                                eventId: event.id,
                                name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
                                player1: {
                                    id: confirmedList[2].id,
                                    displayName: confirmedList[2].displayName,
                                    isGuest: confirmedList[2].isGuest
                                },
                                player2: {
                                    id: confirmedList[3].id,
                                    displayName: confirmedList[3].displayName,
                                    isGuest: confirmedList[3].isGuest
                                },
                                locked: true
                            }
                        ];
                        updatedMatches = [
                            {
                                id: `match_nm_${event.id}_1`,
                                eventId: event.id,
                                stage: 'group',
                                round: 1,
                                courtId: event.courtIds[0] || 'c1',
                                courtName: 'Court 1',
                                team1Id: t1Id,
                                team2Id: t2Id,
                                status: 'in_progress'
                            }
                        ];
                    }
                }
                const newConfirmedCount = updatedParticipants.filter((p)=>p.status === 'confirmed').length;
                const newStatus = newConfirmedCount < event.maxPlayers ? 'open' : event.status;
                return {
                    ...event,
                    status: newStatus,
                    participants: updatedParticipants,
                    teams: updatedTeams,
                    matches: updatedMatches
                };
            }));
    };
    const leaveEvent = (eventId, targetUserId)=>{
        removeParticipant(eventId, targetUserId || currentUser.id);
    };
    const addRegisteredPlayerToEvent = (eventId, userId)=>{
        const targetUser = allPlayers.find((p)=>p.id === userId);
        if (!targetUser) return;
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                if (event.participants.some((p)=>p.id === userId)) return event;
                const confirmedCount = event.participants.filter((p)=>p.status === 'confirmed').length;
                const isFull = confirmedCount >= event.maxPlayers;
                const newParticipant = {
                    id: targetUser.id,
                    displayName: targetUser.displayName,
                    isGuest: false,
                    registeredAt: new Date().toISOString(),
                    status: isFull ? 'waiting_list' : 'confirmed',
                    waitingListPosition: isFull ? event.participants.filter((p)=>p.status === 'waiting_list').length + 1 : undefined
                };
                const updatedParticipants = [
                    ...event.participants,
                    newParticipant
                ];
                const confirmedList = updatedParticipants.filter((p)=>p.status === 'confirmed');
                const newConfirmedCount = confirmedList.length;
                let newStatus = !isFull && newConfirmedCount >= event.maxPlayers ? 'full' : event.status;
                let updatedTeams = event.teams;
                let updatedMatches = event.matches;
                if (event.type === 'normal_match' && newConfirmedCount === 4) {
                    newStatus = 'in_progress';
                    const t1Id = `team_nm_${eventId}_1`;
                    const t2Id = `team_nm_${eventId}_2`;
                    updatedTeams = [
                        {
                            id: t1Id,
                            eventId: event.id,
                            name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
                            player1: {
                                id: confirmedList[0].id,
                                displayName: confirmedList[0].displayName,
                                isGuest: confirmedList[0].isGuest
                            },
                            player2: {
                                id: confirmedList[1].id,
                                displayName: confirmedList[1].displayName,
                                isGuest: confirmedList[1].isGuest
                            },
                            locked: true
                        },
                        {
                            id: t2Id,
                            eventId: event.id,
                            name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
                            player1: {
                                id: confirmedList[2].id,
                                displayName: confirmedList[2].displayName,
                                isGuest: confirmedList[2].isGuest
                            },
                            player2: {
                                id: confirmedList[3].id,
                                displayName: confirmedList[3].displayName,
                                isGuest: confirmedList[3].isGuest
                            },
                            locked: true
                        }
                    ];
                    updatedMatches = [
                        {
                            id: `match_nm_${eventId}_1`,
                            eventId: event.id,
                            stage: 'group',
                            round: 1,
                            courtId: event.courtIds[0] || 'c1',
                            courtName: 'Court 1',
                            team1Id: t1Id,
                            team2Id: t2Id,
                            status: 'in_progress'
                        }
                    ];
                }
                return {
                    ...event,
                    status: newStatus,
                    participants: updatedParticipants,
                    teams: updatedTeams,
                    matches: updatedMatches
                };
            }));
    };
    const addGuestPlayer = (eventId, guestName)=>{
        const guestId = `gst_${Date.now()}`;
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const confirmedCount = event.participants.filter((p)=>p.status === 'confirmed').length;
                const isFull = confirmedCount >= event.maxPlayers;
                const guestParticipant = {
                    id: guestId,
                    displayName: `${guestName} (Guest)`,
                    isGuest: true,
                    addedByUserId: currentUser.id,
                    registeredAt: new Date().toISOString(),
                    status: isFull ? 'waiting_list' : 'confirmed',
                    waitingListPosition: isFull ? event.participants.filter((p)=>p.status === 'waiting_list').length + 1 : undefined
                };
                return {
                    ...event,
                    participants: [
                        ...event.participants,
                        guestParticipant
                    ]
                };
            }));
    };
    const removeGuestPlayer = (eventId, guestId)=>{
        removeParticipant(eventId, guestId);
    };
    const sendPartnerRequest = (eventId, toUserId)=>{
        const targetPlayer = allPlayers.find((p)=>p.id === toUserId);
        if (!targetPlayer) return;
        const newReq = {
            id: `req_${Date.now()}`,
            eventId,
            fromUserId: currentUser.id,
            fromUserName: currentUser.displayName,
            toUserId,
            toUserName: targetPlayer.displayName,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        setPartnerRequests((prev)=>[
                newReq,
                ...prev
            ]);
        // Send notification to recipient
        setNotifications((n)=>[
                {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])(),
                    userId: toUserId,
                    title: 'Partner Request Received ðŸŽ¾',
                    message: `${currentUser.displayName} requested to be your partner for the tournament!`,
                    date: new Date().toISOString(),
                    read: false,
                    eventId
                },
                ...n
            ]);
    };
    const respondToPartnerRequest = (requestId, accept)=>{
        const request = partnerRequests.find((item)=>item.id === requestId);
        if (request) {
            setNotifications((previous)=>[
                    {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])(),
                        userId: request.fromUserId,
                        title: accept ? 'Partner Request Accepted!' : 'Partner Request Declined',
                        message: `${currentUser.displayName} ${accept ? 'accepted' : 'declined'} your partner request.`,
                        date: new Date().toISOString(),
                        read: false,
                        eventId: request.eventId
                    },
                    ...previous
                ]);
        }
        setPartnerRequests((prev)=>prev.map((r)=>{
                if (r.id !== requestId) return r;
                const newStatus = accept ? 'accepted' : 'declined';
                return {
                    ...r,
                    status: newStatus
                };
            }));
    };
    const generateTeams = (eventId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const existingMap = {};
                event.teams.forEach((t)=>{
                    existingMap[t.id] = t;
                });
                const generated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$teams$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateTeamsFromParticipants"])(eventId, event.participants, partnerRequests, existingMap);
                return {
                    ...event,
                    teams: generated,
                    status: 'teams_generated'
                };
            }));
    };
    const updateTeams = (eventId, teams)=>{
        setEvents((prev)=>prev.map((event)=>event.id === eventId ? {
                    ...event,
                    teams
                } : event));
    };
    const generateEventGroupsAction = (eventId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const groups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$groups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateGroups"])(eventId, event.teams, 4);
                return {
                    ...event,
                    groups
                };
            }));
    };
    const updateGroups = (eventId, groups)=>{
        setEvents((prev)=>prev.map((event)=>event.id === eventId ? {
                    ...event,
                    groups
                } : event));
    };
    const generateEventScheduleAction = (eventId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const facility = facilities.find((f)=>f.id === event.facilityId);
                const courtNamesMap = {};
                if (facility) {
                    facility.courts.forEach((c)=>{
                        courtNamesMap[c.id] = c.name;
                    });
                }
                const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$scheduling$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateRoundRobinFixtures"])(eventId, event.groups, event.courtIds, courtNamesMap);
                return {
                    ...event,
                    matches,
                    status: 'ready'
                };
            }));
    };
    const recordMatchScoreAction = (eventId, matchId, team1Score, team2Score, sets)=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(eventId) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(matchId)) {
            const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            void sb.rpc('record_match_score', {
                target_event_id: eventId,
                target_match_id: matchId,
                score_a: team1Score,
                score_b: team2Score,
                set_scores: sets || []
            }).then(({ error })=>{
                if (error) reportOperationError('Could not save match score', error.message);
            });
        }
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const teamsMap = {};
                event.teams.forEach((t)=>{
                    teamsMap[t.id] = t;
                });
                const targetMatch = event.matches.find((m)=>m.id === matchId);
                if (!targetMatch) return event;
                let winnerTeamId = undefined;
                if (sets && sets.length > 0) {
                    let t1SetWins = 0;
                    let t2SetWins = 0;
                    sets.forEach((s)=>{
                        if (s.team1Score > s.team2Score) t1SetWins++;
                        else if (s.team2Score > s.team1Score) t2SetWins++;
                    });
                    if (t1SetWins > t2SetWins) {
                        winnerTeamId = targetMatch.team1Id;
                    } else if (t2SetWins > t1SetWins) {
                        winnerTeamId = targetMatch.team2Id;
                    }
                }
                if (!winnerTeamId) {
                    if (team1Score > team2Score) {
                        winnerTeamId = targetMatch.team1Id;
                    } else if (team2Score > team1Score) {
                        winnerTeamId = targetMatch.team2Id;
                    }
                }
                const updatedMatch = {
                    ...targetMatch,
                    team1Score,
                    team2Score,
                    sets: sets && sets.length > 0 ? sets : targetMatch.sets,
                    winnerTeamId,
                    status: 'completed',
                    recordedByUserId: currentUser.id,
                    recordedAt: new Date().toISOString()
                };
                let updatedMatches = event.matches.map((m)=>m.id === matchId ? updatedMatch : m);
                // Advance knockout winner if knockout stage
                if (updatedMatch.stage === 'knockout') {
                    updatedMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$knockout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["advanceKnockoutWinner"])(updatedMatches, updatedMatch);
                }
                // Check if all final matches completed
                const finalMatch = updatedMatches.find((m)=>m.knockoutStage === 'final');
                let newStatus = event.status;
                if (finalMatch && finalMatch.status === 'completed') {
                    newStatus = 'completed';
                } else if (event.status === 'ready') {
                    newStatus = 'in_progress';
                }
                const updatedEvent = {
                    ...event,
                    status: newStatus,
                    matches: updatedMatches
                };
                // Recalculate player stats
                setAllPlayers((players)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$playerStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["recalculatePlayerStats"])([
                        updatedEvent
                    ], players));
                return updatedEvent;
            }));
    };
    const confirmQualifiersAndKnockout = (eventId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                const teamsMap = {};
                event.teams.forEach((t)=>{
                    teamsMap[t.id] = t;
                });
                const qualifiers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$standings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["identifyQualifiers"])(event.groups, event.matches, teamsMap, event.rules);
                const facility = facilities.find((f)=>f.id === event.facilityId);
                const courtNamesMap = {};
                if (facility) {
                    facility.courts.forEach((c)=>{
                        courtNamesMap[c.id] = c.name;
                    });
                }
                const knockoutMatches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$knockout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateKnockoutBracket"])(eventId, qualifiers, event.courtIds, courtNamesMap);
                return {
                    ...event,
                    status: 'knockout_stage',
                    matches: [
                        ...event.matches.filter((m)=>m.stage === 'group'),
                        ...knockoutMatches
                    ]
                };
            }));
    };
    const addCoAdmin = (eventId, userId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                if (event.coAdminIds.length >= 3 || event.coAdminIds.includes(userId)) return event;
                return {
                    ...event,
                    coAdminIds: [
                        ...event.coAdminIds,
                        userId
                    ]
                };
            }));
    };
    const removeCoAdmin = (eventId, userId)=>{
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                return {
                    ...event,
                    coAdminIds: event.coAdminIds.filter((id)=>id !== userId)
                };
            }));
    };
    const createPlayerGroupAction = async (name, description, memberIds)=>{
        let newGroup = {
            id: `grp_${Date.now()}`,
            name,
            description,
            ownerId: currentUser.id,
            memberIds: Array.from(new Set([
                currentUser.id,
                ...memberIds
            ])),
            createdAt: new Date().toISOString()
        };
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const sb = supabase;
            const { data: { session } } = await sb.auth.getSession();
            const authUid = session?.user?.id;
            if (authUid) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ensureProfile"])(supabase, session.user);
                const persistedMemberIds = memberIds.filter(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"]);
                const { data: insertedGroupId, error: groupError } = await sb.rpc('create_player_group', {
                    group_name: name,
                    group_description: description || '',
                    member_ids: persistedMemberIds
                });
                if (groupError) {
                    reportOperationError('Could not create player group', groupError.message);
                } else if (insertedGroupId) {
                    newGroup = {
                        id: insertedGroupId,
                        name,
                        description,
                        ownerId: authUid,
                        memberIds: Array.from(new Set([
                            authUid,
                            ...memberIds
                        ])),
                        createdAt: new Date().toISOString()
                    };
                }
            }
        } catch (err) {
            console.error('Supabase group exception:', err);
        }
        setPlayerGroups((prev)=>[
                newGroup,
                ...prev
            ]);
        return newGroup;
    };
    const deletePlayerGroupAction = async (groupId)=>{
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(groupId)) {
            const sb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const { data, error } = await sb.rpc('delete_player_group', {
                target_group_id: groupId
            });
            if (error || data !== true) {
                reportOperationError('Could not delete player group', error?.message || 'Group was not deleted');
                return false;
            }
        }
        setPlayerGroups((previous)=>previous.filter((group)=>group.id !== groupId));
        return true;
    };
    const joinPlayerGroupAction = async (groupId, targetUserId, initialGroupData)=>{
        const uid = targetUserId || currentUser.id;
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const sb = supabase;
            const { data: { session } } = await sb.auth.getSession();
            const authUid = session?.user?.id;
            if (authUid) {
                const existingGroup = playerGroups.find((g)=>g.id === groupId);
                if (existingGroup) {
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(groupId) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(uid)) {
                        const { error } = await sb.from('player_group_members').upsert({
                            group_id: groupId,
                            user_id: uid,
                            status: 'active'
                        }, {
                            onConflict: [
                                'group_id',
                                'user_id'
                            ]
                        });
                        if (error) console.error('Supabase upsert player_group_members failed:', error);
                    }
                } else {
                    const { data: insertedGroup, error: groupError } = await sb.from('player_groups').insert({
                        owner_id: initialGroupData?.ownerId || 'usr_organizer',
                        name: initialGroupData?.name || 'Shared Padel Group',
                        description: initialGroupData?.description || null
                    }).select().single();
                    if (groupError) {
                        console.error('Supabase insert player_group failed:', groupError);
                    } else if (insertedGroup) {
                        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidUuid"])(uid)) {
                            await sb.from('player_group_members').insert({
                                group_id: insertedGroup.id,
                                user_id: uid,
                                status: 'active'
                            });
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Supabase join group exception:', err);
        }
        setPlayerGroups((prev)=>{
            const exists = prev.some((g)=>g.id === groupId);
            if (exists) {
                return prev.map((g)=>{
                    if (g.id !== groupId) return g;
                    if (g.memberIds.includes(uid)) return g;
                    return {
                        ...g,
                        memberIds: [
                            ...g.memberIds,
                            uid
                        ],
                        pendingRequestUserIds: (g.pendingRequestUserIds || []).filter((id)=>id !== uid)
                    };
                });
            } else {
                const newGroup = {
                    id: groupId,
                    name: initialGroupData?.name || 'Shared Padel Group',
                    description: initialGroupData?.description || '',
                    ownerId: initialGroupData?.ownerId || 'usr_organizer',
                    memberIds: Array.from(new Set([
                        ...initialGroupData?.memberIds || [
                            'usr_john'
                        ],
                        uid
                    ])),
                    createdAt: initialGroupData?.createdAt || new Date().toISOString()
                };
                return [
                    newGroup,
                    ...prev
                ];
            }
        });
    };
    const addNotification = (userId, title, message)=>{
        setNotifications((prev)=>[
                {
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$contextHelpers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createNotificationId"])(),
                    userId,
                    title,
                    message,
                    date: new Date().toISOString(),
                    read: false
                },
                ...prev
            ]);
    };
    const requestJoinPlayerGroupAction = (groupId, targetUserId, initialGroupData)=>{
        const uid = targetUserId || currentUser.id;
        setPlayerGroups((prev)=>{
            const exists = prev.some((g)=>g.id === groupId);
            if (exists) {
                return prev.map((g)=>{
                    if (g.id !== groupId) return g;
                    if (g.memberIds.includes(uid)) return g;
                    const currentPending = g.pendingRequestUserIds || [];
                    if (currentPending.includes(uid)) return g;
                    return {
                        ...g,
                        pendingRequestUserIds: [
                            ...currentPending,
                            uid
                        ]
                    };
                });
            } else {
                const newGroup = {
                    id: groupId,
                    name: initialGroupData?.name || 'Shared Padel Group',
                    description: initialGroupData?.description || '',
                    ownerId: initialGroupData?.ownerId || 'usr_organizer',
                    memberIds: initialGroupData?.memberIds || [
                        'usr_john'
                    ],
                    pendingRequestUserIds: [
                        uid
                    ],
                    createdAt: initialGroupData?.createdAt || new Date().toISOString()
                };
                return [
                    newGroup,
                    ...prev
                ];
            }
        });
        // Notify group owner
        const group = playerGroups.find((g)=>g.id === groupId) || initialGroupData;
        if (group && group.ownerId) {
            addNotification(group.ownerId, 'New Join Request', `${currentUser.displayName} requested to join your group "${group.name}".`);
        }
    };
    const approveGroupJoinRequestAction = (groupId, requestingUserId)=>{
        let groupName = 'Padel Group';
        setPlayerGroups((prev)=>prev.map((g)=>{
                if (g.id !== groupId) return g;
                groupName = g.name;
                const pending = (g.pendingRequestUserIds || []).filter((id)=>id !== requestingUserId);
                const members = g.memberIds.includes(requestingUserId) ? g.memberIds : [
                    ...g.memberIds,
                    requestingUserId
                ];
                return {
                    ...g,
                    memberIds: members,
                    pendingRequestUserIds: pending
                };
            }));
        addNotification(requestingUserId, 'Group Join Approved', `Your request to join "${groupName}" was approved by the group admin!`);
    };
    const rejectGroupJoinRequestAction = (groupId, requestingUserId)=>{
        let groupName = 'Padel Group';
        setPlayerGroups((prev)=>prev.map((g)=>{
                if (g.id !== groupId) return g;
                groupName = g.name;
                const pending = (g.pendingRequestUserIds || []).filter((id)=>id !== requestingUserId);
                return {
                    ...g,
                    pendingRequestUserIds: pending
                };
            }));
        addNotification(requestingUserId, 'Group Join Request', `Your request to join "${groupName}" was declined.`);
    };
    const inviteGroupToEventAction = (eventId, groupId)=>{
        const group = playerGroups.find((g)=>g.id === groupId);
        if (!group) return;
        setEvents((prev)=>prev.map((event)=>{
                if (event.id !== eventId) return event;
                let currentParticipants = [
                    ...event.participants
                ];
                let confirmedCount = currentParticipants.filter((p)=>p.status === 'confirmed').length;
                group.memberIds.forEach((mId)=>{
                    if (!currentParticipants.some((p)=>p.id === mId)) {
                        const player = allPlayers.find((p)=>p.id === mId);
                        const isFull = confirmedCount >= event.maxPlayers;
                        currentParticipants.push({
                            id: mId,
                            displayName: player ? player.displayName : 'Player',
                            isGuest: false,
                            registeredAt: new Date().toISOString(),
                            status: isFull ? 'waiting_list' : 'confirmed',
                            waitingListPosition: isFull ? currentParticipants.filter((p)=>p.status === 'waiting_list').length + 1 : undefined
                        });
                        if (!isFull) confirmedCount++;
                    }
                });
                return {
                    ...event,
                    participants: currentParticipants,
                    status: confirmedCount >= event.maxPlayers ? 'full' : event.status
                };
            }));
    };
    const saveFacility = async (data)=>{
        let resultFacility = null;
        let supabaseError;
        try {
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const sb = supabase;
            const { data: { session } } = await sb.auth.getSession();
            const authUid = session?.user?.id;
            if (authUid) {
                const facilityInsert = {
                    name: data.name,
                    address: data.address,
                    city: data.city || 'Dubai',
                    country: data.country || 'United Arab Emirates',
                    google_maps_url: data.googleMapsUrl || null,
                    created_by: authUid
                };
                const { data: insertedFacility, error: facilityError } = await sb.from('facilities').insert(facilityInsert).select().single();
                if (facilityError) {
                    console.error('Supabase insert facility failed:', facilityError);
                    supabaseError = facilityError.message;
                } else if (insertedFacility) {
                    // Let the DB generate court UUIDs (don't pass client string ids).
                    const courtsToInsert = (data.courts && data.courts.length > 0 ? data.courts : [
                        {
                            name: 'Court 1'
                        },
                        {
                            name: 'Court 2'
                        },
                        {
                            name: 'Court 3'
                        },
                        {
                            name: 'Court 4'
                        }
                    ]).map((c, idx)=>({
                            facility_id: insertedFacility.id,
                            name: c.name || `Court ${idx + 1}`,
                            court_number: idx + 1
                        }));
                    const { data: insertedCourts, error: courtsError } = await sb.from('courts').insert(courtsToInsert).select();
                    if (courtsError) {
                        console.error('Supabase insert courts failed:', courtsError);
                    }
                    const savedCourts = (insertedCourts || courtsToInsert).map((c)=>({
                            id: c.id,
                            name: c.name
                        }));
                    resultFacility = {
                        id: insertedFacility.id,
                        name: insertedFacility.name,
                        address: insertedFacility.address,
                        city: insertedFacility.city,
                        country: insertedFacility.country,
                        googleMapsUrl: insertedFacility.google_maps_url || '',
                        isFavorite: data.isFavorite ?? true,
                        courts: savedCourts
                    };
                }
            }
        } catch (err) {
            console.error('Supabase facility exception:', err);
            supabaseError = err.message;
        }
        setFacilities((prev)=>{
            const existingIdx = prev.findIndex((f)=>f.id === data.id);
            if (existingIdx >= 0 && resultFacility) {
                const updated = [
                    ...prev
                ];
                updated[existingIdx] = {
                    ...updated[existingIdx],
                    ...resultFacility
                };
                return updated;
            }
            if (resultFacility) {
                return [
                    resultFacility,
                    ...prev
                ];
            }
            return prev;
        });
        if (!resultFacility) {
            if (supabaseError) {
                console.warn('Falling back to local-only facility due to Supabase error:', supabaseError);
            }
            const newId = data.id || `fac_${Date.now()}`;
            const defaultCourts = data.courts && data.courts.length > 0 ? data.courts : [
                {
                    id: `c_${Date.now()}_1`,
                    name: 'Court 1'
                },
                {
                    id: `c_${Date.now()}_2`,
                    name: 'Court 2'
                },
                {
                    id: `c_${Date.now()}_3`,
                    name: 'Court 3'
                },
                {
                    id: `c_${Date.now()}_4`,
                    name: 'Court 4'
                }
            ];
            resultFacility = {
                id: newId,
                name: data.name,
                address: data.address,
                city: data.city || 'Dubai',
                country: data.country || 'United Arab Emirates',
                googleMapsUrl: data.googleMapsUrl || '',
                isFavorite: data.isFavorite ?? true,
                courts: defaultCourts
            };
        }
        return resultFacility;
    };
    const toggleFavoriteFacility = (facilityId)=>{
        setFacilities((prev)=>prev.map((f)=>f.id === facilityId ? {
                    ...f,
                    isFavorite: !f.isFavorite
                } : f));
    };
    const deleteFacility = (facilityId)=>{
        setFacilities((prev)=>prev.filter((f)=>f.id !== facilityId));
    };
    const resetDemoData = ()=>{
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$usePadelPersistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearPadelPersistence"])();
        setAllPlayers(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$seedData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEED_PLAYERS"]);
        setFacilities([]);
        setCurrentUser(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$data$2f$seedData$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SEED_PLAYERS"][0]);
        setEvents([]);
        setPlayerGroups([]);
        setPartnerRequests([]);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PadelContext.Provider, {
        value: {
            currentUser,
            allPlayers,
            facilities,
            events,
            playerGroups,
            notifications,
            clearNotifications,
            partnerRequests,
            signUpAction,
            loginAction,
            logoutAction,
            forgotPasswordAction,
            resetPasswordAction,
            isAuthenticated,
            switchUser,
            loginUser,
            registerUser,
            createEvent,
            updateEvent,
            deleteEvent,
            joinEvent,
            leaveEvent,
            removeParticipant,
            addRegisteredPlayerToEvent,
            addGuestPlayer,
            removeGuestPlayer,
            sendPartnerRequest,
            respondToPartnerRequest,
            generateTeams,
            updateTeams,
            generateEventGroupsAction,
            updateGroups,
            generateEventScheduleAction,
            recordMatchScoreAction,
            confirmQualifiersAndKnockout,
            addCoAdmin,
            removeCoAdmin,
            createPlayerGroupAction,
            deletePlayerGroupAction,
            joinPlayerGroupAction,
            requestJoinPlayerGroupAction,
            approveGroupJoinRequestAction,
            rejectGroupJoinRequestAction,
            inviteGroupToEventAction,
            saveFacility,
            toggleFavoriteFacility,
            deleteFacility,
            resetDemoData,
            updateProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/PadelContext.tsx",
        lineNumber: 1522,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
};
_s(PadelProvider, "Q0DIrrPs73OHCDZOW/wzv1aVybY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$usePadelPersistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePadelPersistence"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseAuthSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSupabaseAuthSync"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$useSupabaseEventSync$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSupabaseEventSync"]
    ];
});
_c = PadelProvider;
const usePadel = ()=>{
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(PadelContext);
    if (!context) {
        throw new Error('usePadel must be used within a PadelProvider');
    }
    return context;
};
_s1(usePadel, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "PadelProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/authProfile.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ensureProfile",
    ()=>ensureProfile,
    "toPlayerProfile",
    ()=>toPlayerProfile
]);
const toPlayerProfile = (profile, user)=>{
    const metadata = user.user_metadata || {};
    const email = profile?.email || user.email || '';
    return {
        id: profile?.id || user.id,
        firstName: profile?.first_name || String(metadata.first_name || 'Player'),
        lastName: profile?.last_name || String(metadata.last_name || ''),
        displayName: profile?.display_name || String(metadata.display_name || email || 'Player'),
        email,
        mobileNumber: profile?.phone || '',
        avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
        createdAt: profile?.created_at || new Date().toISOString(),
        eventsPlayed: 0,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesLost: 0,
        winRate: 0,
        totalGamesWon: 0,
        totalGamesLost: 0,
        recentEvents: []
    };
};
const ensureProfile = async (supabase, user)=>{
    const metadata = user.user_metadata || {};
    const firstName = String(metadata.first_name || 'Player');
    const lastName = String(metadata.last_name || '');
    const displayName = String(metadata.display_name || [
        firstName,
        lastName
    ].filter(Boolean).join(' ') || user.email || 'Player');
    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        email: user.email || '',
        avatar_url: metadata.avatar_url || null
    }, {
        onConflict: 'id'
    });
    if (error) throw error;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/contextHelpers.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createNotificationId",
    ()=>createNotificationId,
    "isValidUuid",
    ()=>isValidUuid
]);
let notificationSequence = 0;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUuid = (id)=>typeof id === 'string' && UUID_RE.test(id);
const createNotificationId = (prefix = 'notif')=>{
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `${prefix}_${crypto.randomUUID()}`;
    }
    notificationSequence += 1;
    return `${prefix}_${Date.now()}_${notificationSequence}`;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/usePadelPersistence.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearPadelPersistence",
    ()=>clearPadelPersistence,
    "usePadelPersistence",
    ()=>usePadelPersistence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const STORAGE_KEY = 'padel_manager_v2_state';
const readJson = (key)=>{
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : undefined;
};
const usePadelPersistence = (options)=>{
    _s();
    const [hydrated, setHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePadelPersistence.useEffect": ()=>{
            try {
                const players = readJson(`${STORAGE_KEY}_players`);
                if (players) options.setAllPlayers(players);
                const facilities = readJson(`${STORAGE_KEY}_facilities`);
                if (facilities) options.setFacilities(facilities);
                const events = readJson(`${STORAGE_KEY}_events`);
                if (events) options.setEvents(events);
                const groups = readJson(`${STORAGE_KEY}_groups`);
                if (groups) options.setPlayerGroups(groups);
                const requests = readJson(`${STORAGE_KEY}_requests`);
                if (requests) options.setPartnerRequests(requests);
                const savedUserId = localStorage.getItem(`${STORAGE_KEY}_current_user`);
                const savedUser = players?.find({
                    "usePadelPersistence.useEffect": (player)=>player.id === savedUserId
                }["usePadelPersistence.useEffect"]);
                if (savedUser) options.setCurrentUser(savedUser);
            } catch  {
            // Corrupt demo state falls back to the provider's seed data.
            } finally{
                setHydrated(true);
            }
        // State setters are stable; hydration intentionally runs once.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }
    }["usePadelPersistence.useEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "usePadelPersistence.useEffect": ()=>{
            if (!hydrated) return;
            localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(options.allPlayers));
            localStorage.setItem(`${STORAGE_KEY}_facilities`, JSON.stringify(options.facilities));
            localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(options.events));
            localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(options.playerGroups));
            localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(options.partnerRequests));
            localStorage.setItem(`${STORAGE_KEY}_current_user`, options.currentUser.id);
        }
    }["usePadelPersistence.useEffect"], [
        hydrated,
        options.allPlayers,
        options.currentUser.id,
        options.events,
        options.facilities,
        options.partnerRequests,
        options.playerGroups
    ]);
    return hydrated;
};
_s(usePadelPersistence, "eLhAYJlZjzjrLIV3tWlUMfTmQq4=");
const clearPadelPersistence = ()=>{
    [
        'players',
        'facilities',
        'events',
        'groups',
        'requests',
        'current_user'
    ].forEach((suffix)=>{
        localStorage.removeItem(`${STORAGE_KEY}_${suffix}`);
    });
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/useSupabaseAuthSync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSupabaseAuthSync",
    ()=>useSupabaseAuthSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/authProfile.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
const useSupabaseAuthSync = ({ setIsAuthenticated, setCurrentUser, setAllPlayers })=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSupabaseAuthSync.useEffect": ()=>{
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            const applySession = {
                "useSupabaseAuthSync.useEffect.applySession": async (session)=>{
                    if (!session?.user) {
                        setIsAuthenticated(false);
                        return;
                    }
                    setIsAuthenticated(true);
                    const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
                    if (!data) return;
                    const playerProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$authProfile$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toPlayerProfile"])(data, session.user);
                    setCurrentUser(playerProfile);
                    setAllPlayers({
                        "useSupabaseAuthSync.useEffect.applySession": (previous)=>previous.some({
                                "useSupabaseAuthSync.useEffect.applySession": (player)=>player.id === playerProfile.id
                            }["useSupabaseAuthSync.useEffect.applySession"]) ? previous : [
                                playerProfile,
                                ...previous
                            ]
                    }["useSupabaseAuthSync.useEffect.applySession"]);
                }
            }["useSupabaseAuthSync.useEffect.applySession"];
            void supabase.auth.getSession().then({
                "useSupabaseAuthSync.useEffect": ({ data })=>applySession(data.session)
            }["useSupabaseAuthSync.useEffect"]).catch({
                "useSupabaseAuthSync.useEffect": (error)=>console.error('Error initializing Supabase Auth:', error)
            }["useSupabaseAuthSync.useEffect"]);
            const { data: { subscription } } = supabase.auth.onAuthStateChange({
                "useSupabaseAuthSync.useEffect": (_event, session)=>{
                    void applySession(session);
                }
            }["useSupabaseAuthSync.useEffect"]);
            return ({
                "useSupabaseAuthSync.useEffect": ()=>subscription.unsubscribe()
            })["useSupabaseAuthSync.useEffect"];
        }
    }["useSupabaseAuthSync.useEffect"], [
        setAllPlayers,
        setCurrentUser,
        setIsAuthenticated
    ]);
};
_s(useSupabaseAuthSync, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/useSupabaseEventSync.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSupabaseEventSync",
    ()=>useSupabaseEventSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
const eventType = (value)=>value === 'normal_match' ? 'normal_match' : 'tournament';
const eventStatus = (value)=>{
    const statuses = [
        'draft',
        'open',
        'full',
        'teams_generated',
        'ready',
        'in_progress',
        'knockout_stage',
        'completed',
        'cancelled'
    ];
    return statuses.includes(value) ? value : 'open';
};
const reconcileEvents = (rows, previous)=>{
    const cachedById = new Map(previous.map((event)=>[
            event.id,
            event
        ]));
    return rows.map((row)=>{
        const cached = cachedById.get(row.id);
        const type = eventType(row.event_type);
        const storedFormat = row.format;
        const format = storedFormat === 'standard_3_sets' || storedFormat === 'americano' || storedFormat === 'custom' ? storedFormat : cached?.format || (type === 'normal_match' ? 'standard_3_sets' : 'custom');
        return {
            id: row.id,
            name: row.name,
            description: row.description || '',
            type,
            format,
            date: row.event_date,
            startTime: row.start_time,
            facilityId: row.facility_id || '',
            facilityName: cached?.facilityName || '',
            courtIds: cached?.courtIds || [],
            ownerId: row.owner_id,
            ownerName: cached?.ownerName || 'Event Owner',
            coAdminIds: cached?.coAdminIds || [],
            maxPlayers: row.max_players,
            maxTeams: row.max_players / 2,
            visibility: row.visibility === 'public' ? 'public' : 'private',
            playerGroupId: row.player_group_id || undefined,
            status: eventStatus(row.status),
            participants: cached?.participants || [],
            teams: cached?.teams || [],
            groups: cached?.groups || [],
            matches: cached?.matches || [],
            rules: cached?.rules || {
                winPoints: 3,
                drawPoints: 1,
                lossPoints: 0,
                tiebreakOrder: [
                    'points',
                    'matchesWon',
                    'scoreDiff',
                    'scoreFor'
                ],
                qualifiersPerGroup: 2
            },
            createdAt: row.created_at
        };
    });
};
const useSupabaseEventSync = (isAuthenticated, setEvents)=>{
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useSupabaseEventSync.useEffect": ()=>{
            if (!isAuthenticated) return;
            const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createClient"])();
            let active = true;
            const refreshEvents = {
                "useSupabaseEventSync.useEffect.refreshEvents": async ()=>{
                    const { data, error } = await supabase.from('events').select('*').order('created_at', {
                        ascending: false
                    });
                    if (error) {
                        console.error('Could not synchronize events from Supabase:', error.message);
                        return;
                    }
                    if (active) setEvents({
                        "useSupabaseEventSync.useEffect.refreshEvents": (previous)=>reconcileEvents(data || [], previous)
                    }["useSupabaseEventSync.useEffect.refreshEvents"]);
                }
            }["useSupabaseEventSync.useEffect.refreshEvents"];
            void refreshEvents();
            const channel = supabase.channel('padel-events-sync').on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'events'
            }, {
                "useSupabaseEventSync.useEffect.channel": ()=>{
                    void refreshEvents();
                }
            }["useSupabaseEventSync.useEffect.channel"]).subscribe();
            const refreshWhenVisible = {
                "useSupabaseEventSync.useEffect.refreshWhenVisible": ()=>{
                    if (document.visibilityState === 'visible') void refreshEvents();
                }
            }["useSupabaseEventSync.useEffect.refreshWhenVisible"];
            window.addEventListener('focus', refreshEvents);
            document.addEventListener('visibilitychange', refreshWhenVisible);
            return ({
                "useSupabaseEventSync.useEffect": ()=>{
                    active = false;
                    window.removeEventListener('focus', refreshEvents);
                    document.removeEventListener('visibilitychange', refreshWhenVisible);
                    void supabase.removeChannel(channel);
                }
            })["useSupabaseEventSync.useEffect"];
        }
    }["useSupabaseEventSync.useEffect"], [
        isAuthenticated,
        setEvents
    ]);
};
_s(useSupabaseEventSync, "OD7bBpZva5O2jO+Puf00hKivP7c=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/data/seedData.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SEED_EVENTS",
    ()=>SEED_EVENTS,
    "SEED_FACILITIES",
    ()=>SEED_FACILITIES,
    "SEED_GROUPS",
    ()=>SEED_GROUPS,
    "SEED_PLAYERS",
    ()=>SEED_PLAYERS
]);
const SEED_FACILITIES = [
    {
        id: 'fac_1',
        name: 'Dubai Padel Club',
        address: 'Al Quoz Industrial Area 3, Dubai',
        city: 'Dubai',
        country: 'United Arab Emirates',
        googleMapsUrl: 'https://maps.google.com/?q=Dubai+Padel+Club',
        isFavorite: true,
        courts: [
            {
                id: 'c1',
                name: 'Court 1'
            },
            {
                id: 'c2',
                name: 'Court 2'
            },
            {
                id: 'c3',
                name: 'Court 3'
            },
            {
                id: 'c4',
                name: 'Court 4'
            },
            {
                id: 'c5',
                name: 'Court 5'
            },
            {
                id: 'c6',
                name: 'Court 6'
            },
            {
                id: 'c7',
                name: 'Court 7'
            },
            {
                id: 'c8',
                name: 'Court 8'
            }
        ]
    },
    {
        id: 'fac_2',
        name: 'WPA Padel Academy Meydan',
        address: 'Meydan Racecourse, Nad Al Sheba, Dubai',
        city: 'Dubai',
        country: 'United Arab Emirates',
        googleMapsUrl: 'https://maps.google.com/?q=WPA+Padel+Academy+Meydan',
        isFavorite: true,
        courts: [
            {
                id: 'wpa_1',
                name: 'Court A'
            },
            {
                id: 'wpa_2',
                name: 'Court B'
            },
            {
                id: 'wpa_3',
                name: 'Court C'
            },
            {
                id: 'wpa_4',
                name: 'Court D'
            },
            {
                id: 'wpa_5',
                name: 'Court E'
            },
            {
                id: 'wpa_6',
                name: 'Court F'
            },
            {
                id: 'wpa_7',
                name: 'Court G'
            },
            {
                id: 'wpa_8',
                name: 'Court H'
            }
        ]
    },
    {
        id: 'fac_3',
        name: 'Real Padel Club Sharjah',
        address: 'Al Mirgab, Sharjah',
        city: 'Sharjah',
        country: 'United Arab Emirates',
        googleMapsUrl: 'https://maps.google.com/?q=Real+Padel+Club+Sharjah',
        isFavorite: true,
        courts: [
            {
                id: 'rpc_1',
                name: 'Court 1'
            },
            {
                id: 'rpc_2',
                name: 'Court 2'
            },
            {
                id: 'rpc_3',
                name: 'Court 3'
            },
            {
                id: 'rpc_4',
                name: 'Court 4'
            }
        ]
    }
];
const SEED_PLAYERS = [
    {
        id: 'usr_simone',
        firstName: 'Simone',
        lastName: 'Rossi',
        displayName: 'Simone Rossi',
        email: 'simone@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 50 123 4567',
        createdAt: '2026-01-10T10:00:00Z',
        eventsPlayed: 12,
        matchesPlayed: 36,
        matchesWon: 28,
        matchesLost: 8,
        winRate: 78,
        totalGamesWon: 210,
        totalGamesLost: 120,
        recentEvents: [
            {
                eventId: 'evt_dubai_championship_2026',
                eventName: 'Dubai Night Padel Championship 2026',
                date: '2026-08-08',
                result: 'Qualified'
            }
        ]
    },
    {
        id: 'usr_marco',
        firstName: 'Marco',
        lastName: 'Rossi',
        displayName: 'Marco Rossi',
        email: 'marco@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 50 234 5678',
        createdAt: '2026-01-12T11:00:00Z',
        eventsPlayed: 10,
        matchesPlayed: 30,
        matchesWon: 22,
        matchesLost: 8,
        winRate: 73,
        totalGamesWon: 175,
        totalGamesLost: 105,
        recentEvents: [
            {
                eventId: 'evt_dubai_championship_2026',
                eventName: 'Dubai Night Padel Championship 2026',
                date: '2026-08-08',
                result: 'Qualified'
            }
        ]
    },
    {
        id: 'usr_ahmed',
        firstName: 'Ahmed',
        lastName: 'Al Mansoori',
        displayName: 'Ahmed Al Mansoori',
        email: 'ahmed@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 52 345 6789',
        createdAt: '2026-01-15T12:00:00Z',
        eventsPlayed: 15,
        matchesPlayed: 45,
        matchesWon: 31,
        matchesLost: 14,
        winRate: 69,
        totalGamesWon: 240,
        totalGamesLost: 160,
        recentEvents: [
            {
                eventId: 'evt_dubai_championship_2026',
                eventName: 'Dubai Night Padel Championship 2026',
                date: '2026-08-08',
                result: 'Qualified'
            }
        ]
    },
    {
        id: 'usr_john',
        firstName: 'John',
        lastName: 'Smith',
        displayName: 'John Smith',
        email: 'john@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 55 456 7890',
        createdAt: '2026-01-20T09:00:00Z',
        eventsPlayed: 8,
        matchesPlayed: 24,
        matchesWon: 15,
        matchesLost: 9,
        winRate: 63,
        totalGamesWon: 130,
        totalGamesLost: 98,
        recentEvents: []
    },
    {
        id: 'usr_alex',
        firstName: 'Alex',
        lastName: 'Rivera',
        displayName: 'Alex Rivera',
        email: 'alex@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 50 567 8901',
        createdAt: '2026-02-01T14:00:00Z',
        eventsPlayed: 14,
        matchesPlayed: 42,
        matchesWon: 27,
        matchesLost: 15,
        winRate: 64,
        totalGamesWon: 220,
        totalGamesLost: 150,
        recentEvents: []
    },
    {
        id: 'usr_david',
        firstName: 'David',
        lastName: 'Chen',
        displayName: 'David Chen',
        email: 'david@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 54 678 9012',
        createdAt: '2026-02-05T15:00:00Z',
        eventsPlayed: 9,
        matchesPlayed: 27,
        matchesWon: 16,
        matchesLost: 11,
        winRate: 59,
        totalGamesWon: 140,
        totalGamesLost: 115,
        recentEvents: []
    },
    {
        id: 'usr_omar',
        firstName: 'Omar',
        lastName: 'Al Zaabi',
        displayName: 'Omar Al Zaabi',
        email: 'omar@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 56 789 0123',
        createdAt: '2026-02-10T16:00:00Z',
        eventsPlayed: 11,
        matchesPlayed: 33,
        matchesWon: 20,
        matchesLost: 13,
        winRate: 61,
        totalGamesWon: 180,
        totalGamesLost: 135,
        recentEvents: []
    },
    {
        id: 'usr_chris',
        firstName: 'Chris',
        lastName: 'Evans',
        displayName: 'Chris Evans',
        email: 'chris@example.com',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
        mobileNumber: '+971 50 890 1234',
        createdAt: '2026-02-15T17:00:00Z',
        eventsPlayed: 7,
        matchesPlayed: 21,
        matchesWon: 11,
        matchesLost: 10,
        winRate: 52,
        totalGamesWon: 105,
        totalGamesLost: 100,
        recentEvents: []
    }
];
// Generate 40 additional UAE padel players
const FIRST_NAMES = [
    'Saeed',
    'Rashid',
    'Tariq',
    'Youssef',
    'Hamdan',
    'Faisal',
    'Zayed',
    'Lucas',
    'Mateo',
    'Pablo',
    'Carlos',
    'Diego',
    'Gonzalo',
    'Fernando',
    'Javier',
    'Hugo',
    'Adrian',
    'Liam',
    'Sebastian',
    'Julian'
];
const LAST_NAMES = [
    'Al Maktoum',
    'Al Habtoor',
    'Al Qasimi',
    'Al Nahyan',
    'Garcia',
    'Martinez',
    'Lopez',
    'Hernandez',
    'Gonzalez',
    'Rodriguez',
    'Perez',
    'Sanchez',
    'Ramirez',
    'Torres',
    'Flores',
    'Diaz',
    'Vasquez',
    'Gomez',
    'Morales',
    'Reyes'
];
for(let i = 1; i <= 40; i++){
    const fName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lName = LAST_NAMES[i * 3 % LAST_NAMES.length];
    SEED_PLAYERS.push({
        id: `usr_gen_${i}`,
        firstName: fName,
        lastName: lName,
        displayName: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase().replace(/\s+/g, '')}${i}@example.com`,
        avatarUrl: `https://i.pravatar.cc/150?u=user_gen_${i}`,
        mobileNumber: `+971 50 ${100 + i} ${2000 + i}`,
        createdAt: '2026-03-01T10:00:00Z',
        eventsPlayed: 5 + i % 8,
        matchesPlayed: 15 + i % 20,
        matchesWon: 8 + i % 12,
        matchesLost: 7 + i % 8,
        winRate: 50 + i % 30,
        totalGamesWon: 80 + i * 5,
        totalGamesLost: 70 + i * 4,
        recentEvents: []
    });
}
const SEED_GROUPS = [
    {
        id: 'grp_1',
        name: 'Friday Padel Crew',
        description: 'Weekly Friday night padel group in Dubai Al Quoz.',
        ownerId: 'usr_simone',
        memberIds: [
            'usr_simone',
            'usr_marco',
            'usr_ahmed',
            'usr_john',
            'usr_alex',
            'usr_david',
            'usr_omar',
            'usr_chris'
        ],
        createdAt: '2026-01-15T10:00:00Z'
    },
    {
        id: 'grp_2',
        name: 'Meydan Morning League',
        description: 'Early morning padel sessions at WPA Meydan.',
        ownerId: 'usr_ahmed',
        memberIds: [
            'usr_ahmed',
            'usr_john',
            'usr_simone',
            'usr_alex',
            'usr_gen_1',
            'usr_gen_2'
        ],
        createdAt: '2026-02-01T10:00:00Z'
    }
];
// Helper to construct full 48-player seed tournament
function buildSeedTournament() {
    const eventId = 'evt_dubai_championship_2026';
    // 48 Participants (48 confirmed)
    const participants = SEED_PLAYERS.map((p, idx)=>({
            id: p.id,
            displayName: p.displayName,
            isGuest: false,
            registeredAt: `2026-08-01T${10 + idx % 10}:00:00Z`,
            status: 'confirmed'
        }));
    // 24 Teams
    const teams = [];
    for(let i = 0; i < 24; i++){
        const p1 = SEED_PLAYERS[i * 2];
        const p2 = SEED_PLAYERS[i * 2 + 1];
        teams.push({
            id: `team_${eventId}_${i + 1}`,
            eventId,
            name: i === 0 ? 'Simone & Marco' : i === 1 ? 'Ahmed & John' : i === 2 ? 'Alex & David' : `Team ${String(i + 1).padStart(2, '0')}`,
            player1: {
                id: p1.id,
                displayName: p1.displayName,
                isGuest: false
            },
            player2: {
                id: p2.id,
                displayName: p2.displayName,
                isGuest: false
            },
            locked: true,
            groupId: `group_${eventId}_${Math.floor(i / 4) + 1}`
        });
    }
    // 6 Groups (Group A to F)
    const groupLetters = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F'
    ];
    const groups = groupLetters.map((letter, gIdx)=>({
            id: `group_${eventId}_${gIdx + 1}`,
            eventId,
            name: `Group ${letter}`,
            teamIds: teams.slice(gIdx * 4, gIdx * 4 + 4).map((t)=>t.id)
        }));
    // Matches for Group Stage (6 groups x 6 matches = 36 group matches)
    const courtIds = [
        'c1',
        'c2',
        'c3',
        'c4',
        'c5',
        'c6'
    ];
    const courtNames = [
        'Court 1',
        'Court 2',
        'Court 3',
        'Court 4',
        'Court 5',
        'Court 6'
    ];
    const matches = [];
    let matchCounter = 1;
    groups.forEach((g, gIdx)=>{
        const c1Id = courtIds[gIdx * 2 % 6];
        const c2Id = courtIds[(gIdx * 2 + 1) % 6];
        const c1Name = courtNames[gIdx * 2 % 6];
        const c2Name = courtNames[(gIdx * 2 + 1) % 6];
        const [t1, t2, t3, t4] = g.teamIds;
        // Round 1 (Completed)
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 1,
            courtId: c1Id,
            courtName: c1Name,
            team1Id: t1,
            team2Id: t2,
            team1Score: 6,
            team2Score: 4,
            winnerTeamId: t1,
            status: 'completed'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 1,
            courtId: c2Id,
            courtName: c2Name,
            team1Id: t3,
            team2Id: t4,
            team1Score: 6,
            team2Score: 2,
            winnerTeamId: t3,
            status: 'completed'
        });
        // Round 2 (Completed)
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 2,
            courtId: c1Id,
            courtName: c1Name,
            team1Id: t1,
            team2Id: t3,
            team1Score: 6,
            team2Score: 3,
            winnerTeamId: t1,
            status: 'completed'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 2,
            courtId: c2Id,
            courtName: c2Name,
            team1Id: t2,
            team2Id: t4,
            team1Score: 6,
            team2Score: 5,
            winnerTeamId: t2,
            status: 'completed'
        });
        // Round 3 (Completed)
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 3,
            courtId: c1Id,
            courtName: c1Name,
            team1Id: t1,
            team2Id: t4,
            team1Score: 6,
            team2Score: 1,
            winnerTeamId: t1,
            status: 'completed'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: g.id,
            round: 3,
            courtId: c2Id,
            courtName: c2Name,
            team1Id: t2,
            team2Id: t3,
            team1Score: 4,
            team2Score: 6,
            winnerTeamId: t3,
            status: 'completed'
        });
    });
    // Knockout Stage Matches (Quarter-Finals -> Semi-Finals -> Final)
    const qf1Id = `ko_${eventId}_qf_1`;
    const qf2Id = `ko_${eventId}_qf_2`;
    const qf3Id = `ko_${eventId}_qf_3`;
    const qf4Id = `ko_${eventId}_qf_4`;
    const sf1Id = `ko_${eventId}_sf_1`;
    const sf2Id = `ko_${eventId}_sf_2`;
    const finalId = `ko_${eventId}_final`;
    // Final Match
    matches.push({
        id: finalId,
        eventId,
        stage: 'knockout',
        round: 3,
        courtId: 'c1',
        courtName: 'Court 1',
        team1Id: '',
        team2Id: '',
        status: 'scheduled',
        knockoutStage: 'final',
        knockoutMatchNumber: 1
    });
    // Semi Finals
    matches.push({
        id: sf1Id,
        eventId,
        stage: 'knockout',
        round: 2,
        courtId: 'c1',
        courtName: 'Court 1',
        team1Id: '',
        team2Id: '',
        status: 'scheduled',
        knockoutStage: 'semi_finals',
        knockoutMatchNumber: 1,
        nextKnockoutMatchId: finalId,
        nextKnockoutSlot: 1
    });
    matches.push({
        id: sf2Id,
        eventId,
        stage: 'knockout',
        round: 2,
        courtId: 'c2',
        courtName: 'Court 2',
        team1Id: '',
        team2Id: '',
        status: 'scheduled',
        knockoutStage: 'semi_finals',
        knockoutMatchNumber: 2,
        nextKnockoutMatchId: finalId,
        nextKnockoutSlot: 2
    });
    // Quarter Finals (Active/Ready)
    matches.push({
        id: qf1Id,
        eventId,
        stage: 'knockout',
        round: 1,
        courtId: 'c1',
        courtName: 'Court 1',
        team1Id: teams[0].id,
        team2Id: teams[5].id,
        status: 'ready',
        knockoutStage: 'quarter_finals',
        knockoutMatchNumber: 1,
        nextKnockoutMatchId: sf1Id,
        nextKnockoutSlot: 1
    });
    matches.push({
        id: qf2Id,
        eventId,
        stage: 'knockout',
        round: 1,
        courtId: 'c2',
        courtName: 'Court 2',
        team1Id: teams[4].id,
        team2Id: teams[1].id,
        status: 'ready',
        knockoutStage: 'quarter_finals',
        knockoutMatchNumber: 2,
        nextKnockoutMatchId: sf1Id,
        nextKnockoutSlot: 2
    });
    matches.push({
        id: qf3Id,
        eventId,
        stage: 'knockout',
        round: 1,
        courtId: 'c3',
        courtName: 'Court 3',
        team1Id: teams[8].id,
        team2Id: teams[13].id,
        status: 'ready',
        knockoutStage: 'quarter_finals',
        knockoutMatchNumber: 3,
        nextKnockoutMatchId: sf2Id,
        nextKnockoutSlot: 1
    });
    matches.push({
        id: qf4Id,
        eventId,
        stage: 'knockout',
        round: 1,
        courtId: 'c4',
        courtName: 'Court 4',
        team1Id: teams[12].id,
        team2Id: teams[9].id,
        status: 'ready',
        knockoutStage: 'quarter_finals',
        knockoutMatchNumber: 4,
        nextKnockoutMatchId: sf2Id,
        nextKnockoutSlot: 2
    });
    return {
        id: eventId,
        name: 'Dubai Night Padel Championship 2026',
        description: 'Premier 48-player private tournament in Dubai Al Quoz featuring 24 teams across 6 groups and 6 courts with knockout bracket progression.',
        type: 'tournament',
        format: 'custom',
        date: '2026-08-08',
        startTime: '19:00',
        facilityId: 'fac_1',
        facilityName: 'Dubai Padel Club',
        courtIds: [
            'c1',
            'c2',
            'c3',
            'c4',
            'c5',
            'c6'
        ],
        ownerId: 'usr_simone',
        ownerName: 'Simone Rossi',
        coAdminIds: [
            'usr_ahmed',
            'usr_marco'
        ],
        maxPlayers: 48,
        maxTeams: 24,
        visibility: 'private',
        status: 'knockout_stage',
        participants,
        teams,
        groups,
        matches,
        rules: {
            winPoints: 3,
            drawPoints: 1,
            lossPoints: 0,
            tiebreakOrder: [
                'points',
                'matchesWon',
                'scoreDiff',
                'scoreFor'
            ],
            qualifiersPerGroup: 2
        },
        createdAt: '2026-08-01T10:00:00Z'
    };
}
const SEED_EVENTS = [
    buildSeedTournament(),
    {
        id: 'evt_normal_match_1',
        name: 'Friday Morning 2v2 Challenge',
        description: 'Casual high-tempo 2v2 padel set at WPA Meydan.',
        type: 'normal_match',
        format: 'standard_3_sets',
        date: '2026-08-08',
        startTime: '09:00',
        facilityId: 'fac_2',
        facilityName: 'WPA Padel Academy Meydan',
        courtIds: [
            'wpa_1'
        ],
        ownerId: 'usr_simone',
        ownerName: 'Simone Rossi',
        coAdminIds: [],
        maxPlayers: 4,
        maxTeams: 2,
        visibility: 'private',
        status: 'in_progress',
        participants: [
            {
                id: 'usr_simone',
                displayName: 'Simone Rossi',
                isGuest: false,
                registeredAt: '2026-08-05T10:00:00Z',
                status: 'confirmed'
            },
            {
                id: 'usr_marco',
                displayName: 'Marco Rossi',
                isGuest: false,
                registeredAt: '2026-08-05T10:05:00Z',
                status: 'confirmed'
            },
            {
                id: 'usr_ahmed',
                displayName: 'Ahmed Al Mansoori',
                isGuest: false,
                registeredAt: '2026-08-05T10:10:00Z',
                status: 'confirmed'
            },
            {
                id: 'usr_john',
                displayName: 'John Smith',
                isGuest: false,
                registeredAt: '2026-08-05T10:15:00Z',
                status: 'confirmed'
            }
        ],
        teams: [
            {
                id: 'team_normal_1',
                eventId: 'evt_normal_match_1',
                name: 'Simone & Marco',
                player1: {
                    id: 'usr_simone',
                    displayName: 'Simone Rossi',
                    isGuest: false
                },
                player2: {
                    id: 'usr_marco',
                    displayName: 'Marco Rossi',
                    isGuest: false
                },
                locked: true
            },
            {
                id: 'team_normal_2',
                eventId: 'evt_normal_match_1',
                name: 'Ahmed & John',
                player1: {
                    id: 'usr_ahmed',
                    displayName: 'Ahmed Al Mansoori',
                    isGuest: false
                },
                player2: {
                    id: 'usr_john',
                    displayName: 'John Smith',
                    isGuest: false
                },
                locked: true
            }
        ],
        groups: [],
        matches: [
            {
                id: 'match_normal_1',
                eventId: 'evt_normal_match_1',
                stage: 'group',
                round: 1,
                courtId: 'wpa_1',
                courtName: 'Court A',
                team1Id: 'team_normal_1',
                team2Id: 'team_normal_2',
                status: 'in_progress'
            }
        ],
        rules: {
            winPoints: 3,
            drawPoints: 1,
            lossPoints: 0,
            tiebreakOrder: [
                'points',
                'matchesWon',
                'scoreDiff'
            ],
            qualifiersPerGroup: 1
        },
        createdAt: '2026-08-05T10:00:00Z'
    },
    {
        id: 'evt_abudhabi_cup_2026',
        name: 'Abu Dhabi Weekend Cup',
        description: 'Open 16-player private tournament accepting new registrations and preferred partner selections.',
        type: 'tournament',
        format: 'americano',
        date: '2026-08-15',
        startTime: '18:00',
        facilityId: 'fac_3',
        facilityName: 'Real Padel Club Sharjah',
        courtIds: [
            'rpc_1',
            'rpc_2',
            'rpc_3',
            'rpc_4'
        ],
        ownerId: 'usr_ahmed',
        ownerName: 'Ahmed Al Mansoori',
        coAdminIds: [
            'usr_simone'
        ],
        maxPlayers: 16,
        maxTeams: 8,
        visibility: 'private',
        status: 'open',
        participants: [
            {
                id: 'usr_ahmed',
                displayName: 'Ahmed Al Mansoori',
                isGuest: false,
                registeredAt: '2026-08-06T10:00:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_john'
            },
            {
                id: 'usr_john',
                displayName: 'John Smith',
                isGuest: false,
                registeredAt: '2026-08-06T10:05:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_ahmed'
            },
            {
                id: 'usr_alex',
                displayName: 'Alex Rivera',
                isGuest: false,
                registeredAt: '2026-08-06T11:00:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_david'
            },
            {
                id: 'usr_david',
                displayName: 'David Chen',
                isGuest: false,
                registeredAt: '2026-08-06T11:10:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_alex'
            },
            {
                id: 'usr_simone',
                displayName: 'Simone Rossi',
                isGuest: false,
                registeredAt: '2026-08-06T12:00:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_marco'
            },
            {
                id: 'usr_marco',
                displayName: 'Marco Rossi',
                isGuest: false,
                registeredAt: '2026-08-06T12:05:00Z',
                status: 'confirmed',
                preferredPartnerId: 'usr_simone'
            }
        ],
        teams: [],
        groups: [],
        matches: [],
        rules: {
            winPoints: 3,
            drawPoints: 1,
            lossPoints: 0,
            tiebreakOrder: [
                'points',
                'matchesWon',
                'scoreDiff',
                'scoreFor'
            ],
            qualifiersPerGroup: 2
        },
        createdAt: '2026-08-06T10:00:00Z'
    }
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/groups.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateGroups",
    ()=>generateGroups
]);
function generateGroups(eventId, teams, teamsPerGroup = 4) {
    const groups = [];
    const groupLetters = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J'
    ];
    let teamIndex = 0;
    let groupCount = Math.ceil(teams.length / teamsPerGroup);
    for(let g = 0; g < groupCount; g++){
        const groupName = `Group ${groupLetters[g] || String(g + 1)}`;
        const groupTeams = teams.slice(teamIndex, teamIndex + teamsPerGroup);
        const groupId = `group_${eventId}_${g + 1}`;
        // Tag team with groupId
        groupTeams.forEach((t)=>{
            t.groupId = groupId;
        });
        groups.push({
            id: groupId,
            eventId,
            name: groupName,
            teamIds: groupTeams.map((t)=>t.id)
        });
        teamIndex += teamsPerGroup;
    }
    return groups;
} /**
 * 3. Round-Robin Fixtures & Court Rotation Generator
 * For a group of 4 teams (A, B, C, D):
 * Round 1: A vs B, C vs D
 * Round 2: A vs C, B vs D
 * Round 3: A vs D, B vs C
 * Rotates assigned courts across rounds!
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/knockout.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "advanceKnockoutWinner",
    ()=>advanceKnockoutWinner,
    "generateKnockoutBracket",
    ()=>generateKnockoutBracket
]);
function generateKnockoutBracket(eventId, qualifiers, availableCourtIds, courtNamesMap) {
    const knockoutMatches = [];
    const hasCourts = availableCourtIds && availableCourtIds.length > 0;
    const c1 = hasCourts ? availableCourtIds[0] : '';
    const c2 = hasCourts ? availableCourtIds[1] || c1 : '';
    const c1Name = c1 ? courtNamesMap[c1] || 'Court 1' : 'Court TBD';
    const c2Name = c2 ? courtNamesMap[c2] || 'Court 2' : 'Court TBD';
    const totalQualifiers = qualifiers.length;
    if (totalQualifiers >= 8) {
        // 8 teams: Quarter Finals (4 matches) -> Semi Finals (2 matches) -> Final (1 match)
        const qf1Id = `ko_${eventId}_qf_1`;
        const qf2Id = `ko_${eventId}_qf_2`;
        const qf3Id = `ko_${eventId}_qf_3`;
        const qf4Id = `ko_${eventId}_qf_4`;
        const sf1Id = `ko_${eventId}_sf_1`;
        const sf2Id = `ko_${eventId}_sf_2`;
        const finalId = `ko_${eventId}_final`;
        // Seed group winners first, followed by runners-up and best third-place
        // qualifiers. Pair high seeds with low seeds from another group whenever
        // possible, which also supports three-group tournaments without duplicates.
        const seeded = qualifiers.slice(0, 8).sort((a, b)=>a.position - b.position || a.groupName.localeCompare(b.groupName));
        const remaining = [
            ...seeded
        ];
        const quarterFinalPairs = [];
        while(remaining.length >= 2){
            const highSeed = remaining.shift();
            let opponentIndex = -1;
            for(let index = remaining.length - 1; index >= 0; index -= 1){
                if (remaining[index].groupName !== highSeed.groupName) {
                    opponentIndex = index;
                    break;
                }
            }
            if (opponentIndex < 0) opponentIndex = remaining.length - 1;
            const opponent = remaining.splice(opponentIndex, 1)[0];
            quarterFinalPairs.push([
                highSeed,
                opponent
            ]);
        }
        const [[q1a, q1b], [q2a, q2b], [q3a, q3b], [q4a, q4b]] = quarterFinalPairs;
        const q1T1 = q1a?.team.id || '';
        const q1T2 = q1b?.team.id || '';
        const q2T1 = q2a?.team.id || '';
        const q2T2 = q2b?.team.id || '';
        const q3T1 = q3a?.team.id || '';
        const q3T2 = q3b?.team.id || '';
        const q4T1 = q4a?.team.id || '';
        const q4T2 = q4b?.team.id || '';
        // Final Match
        knockoutMatches.push({
            id: finalId,
            eventId,
            stage: 'knockout',
            round: 3,
            courtId: c1,
            courtName: c1Name,
            team1Id: '',
            team2Id: '',
            status: 'scheduled',
            knockoutStage: 'final',
            knockoutMatchNumber: 1
        });
        // Semi Finals
        knockoutMatches.push({
            id: sf1Id,
            eventId,
            stage: 'knockout',
            round: 2,
            courtId: c1,
            courtName: c1Name,
            team1Id: '',
            team2Id: '',
            status: 'scheduled',
            knockoutStage: 'semi_finals',
            knockoutMatchNumber: 1,
            nextKnockoutMatchId: finalId,
            nextKnockoutSlot: 1
        });
        knockoutMatches.push({
            id: sf2Id,
            eventId,
            stage: 'knockout',
            round: 2,
            courtId: c2,
            courtName: c2Name,
            team1Id: '',
            team2Id: '',
            status: 'scheduled',
            knockoutStage: 'semi_finals',
            knockoutMatchNumber: 2,
            nextKnockoutMatchId: finalId,
            nextKnockoutSlot: 2
        });
        // Quarter Finals
        knockoutMatches.push({
            id: qf1Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c1,
            courtName: c1Name,
            team1Id: q1T1,
            team2Id: q1T2,
            status: 'ready',
            knockoutStage: 'quarter_finals',
            knockoutMatchNumber: 1,
            nextKnockoutMatchId: sf1Id,
            nextKnockoutSlot: 1
        });
        knockoutMatches.push({
            id: qf2Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c2,
            courtName: c2Name,
            team1Id: q2T1,
            team2Id: q2T2,
            status: 'ready',
            knockoutStage: 'quarter_finals',
            knockoutMatchNumber: 2,
            nextKnockoutMatchId: sf1Id,
            nextKnockoutSlot: 2
        });
        knockoutMatches.push({
            id: qf3Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c1,
            courtName: c1Name,
            team1Id: q3T1,
            team2Id: q3T2,
            status: 'ready',
            knockoutStage: 'quarter_finals',
            knockoutMatchNumber: 3,
            nextKnockoutMatchId: sf2Id,
            nextKnockoutSlot: 1
        });
        knockoutMatches.push({
            id: qf4Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c2,
            courtName: c2Name,
            team1Id: q4T1,
            team2Id: q4T2,
            status: 'ready',
            knockoutStage: 'quarter_finals',
            knockoutMatchNumber: 4,
            nextKnockoutMatchId: sf2Id,
            nextKnockoutSlot: 2
        });
    } else {
        // 4 teams: Semi Finals -> Final
        const sf1Id = `ko_${eventId}_sf_1`;
        const sf2Id = `ko_${eventId}_sf_2`;
        const finalId = `ko_${eventId}_final`;
        const q1 = qualifiers[0]?.team.id || '';
        const q2 = qualifiers[1]?.team.id || '';
        const q3 = qualifiers[2]?.team.id || '';
        const q4 = qualifiers[3]?.team.id || '';
        knockoutMatches.push({
            id: finalId,
            eventId,
            stage: 'knockout',
            round: 2,
            courtId: c1,
            courtName: c1Name,
            team1Id: '',
            team2Id: '',
            status: 'scheduled',
            knockoutStage: 'final',
            knockoutMatchNumber: 1
        });
        knockoutMatches.push({
            id: sf1Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c1,
            courtName: c1Name,
            team1Id: q1,
            team2Id: q2,
            status: 'ready',
            knockoutStage: 'semi_finals',
            knockoutMatchNumber: 1,
            nextKnockoutMatchId: finalId,
            nextKnockoutSlot: 1
        });
        knockoutMatches.push({
            id: sf2Id,
            eventId,
            stage: 'knockout',
            round: 1,
            courtId: c2,
            courtName: c2Name,
            team1Id: q3,
            team2Id: q4,
            status: 'ready',
            knockoutStage: 'semi_finals',
            knockoutMatchNumber: 2,
            nextKnockoutMatchId: finalId,
            nextKnockoutSlot: 2
        });
    }
    return knockoutMatches;
}
function advanceKnockoutWinner(matches, completedMatch) {
    if (!completedMatch.winnerTeamId || !completedMatch.nextKnockoutMatchId || !completedMatch.nextKnockoutSlot) {
        return matches;
    }
    return matches.map((m)=>{
        if (m.id === completedMatch.nextKnockoutMatchId) {
            const updated = {
                ...m
            };
            if (completedMatch.nextKnockoutSlot === 1) {
                updated.team1Id = completedMatch.winnerTeamId;
            } else {
                updated.team2Id = completedMatch.winnerTeamId;
            }
            if (updated.team1Id && updated.team2Id) {
                updated.status = 'ready';
            }
            return updated;
        }
        return m;
    });
} /**
 * 8. Player Statistics Engine
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/playerStats.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "recalculatePlayerStats",
    ()=>recalculatePlayerStats
]);
function recalculatePlayerStats(events, users) {
    const statsMap = {};
    users.forEach((u)=>{
        statsMap[u.id] = {
            eventsPlayed: new Set(),
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            totalGamesWon: 0,
            totalGamesLost: 0,
            recentEvents: new Map()
        };
    });
    events.forEach((event)=>{
        if (event.status !== 'completed' && event.status !== 'in_progress' && event.status !== 'knockout_stage') {
            return;
        }
        const teamsMap = {};
        event.teams.forEach((t)=>{
            teamsMap[t.id] = t;
        });
        // Check matches
        event.matches.forEach((m)=>{
            if (m.status !== 'completed' || typeof m.team1Score !== 'number' || typeof m.team2Score !== 'number') {
                return;
            }
            const team1 = teamsMap[m.team1Id];
            const team2 = teamsMap[m.team2Id];
            if (!team1 || !team2) return;
            const team1Players = [
                team1.player1.id,
                team1.player2.id
            ];
            const team2Players = [
                team2.player1.id,
                team2.player2.id
            ];
            let games1 = m.team1Score || 0;
            let games2 = m.team2Score || 0;
            if (m.sets && m.sets.length > 0) {
                games1 = m.sets.reduce((sum, s)=>sum + (s.team1Score || 0), 0);
                games2 = m.sets.reduce((sum, s)=>sum + (s.team2Score || 0), 0);
            }
            // Team 1 players
            team1Players.forEach((pId)=>{
                if (!statsMap[pId]) return;
                statsMap[pId].eventsPlayed.add(event.id);
                statsMap[pId].matchesPlayed += 1;
                statsMap[pId].totalGamesWon += games1;
                statsMap[pId].totalGamesLost += games2;
                if (m.winnerTeamId === team1.id) {
                    statsMap[pId].matchesWon += 1;
                } else if (m.winnerTeamId === team2.id) {
                    statsMap[pId].matchesLost += 1;
                }
            });
            // Team 2 players
            team2Players.forEach((pId)=>{
                if (!statsMap[pId]) return;
                statsMap[pId].eventsPlayed.add(event.id);
                statsMap[pId].matchesPlayed += 1;
                statsMap[pId].totalGamesWon += games2;
                statsMap[pId].totalGamesLost += games1;
                if (m.winnerTeamId === team2.id) {
                    statsMap[pId].matchesWon += 1;
                } else if (m.winnerTeamId === team1.id) {
                    statsMap[pId].matchesLost += 1;
                }
            });
        });
        // Tag event result if completed
        if (event.status === 'completed') {
            const finalMatch = event.matches.find((m)=>m.knockoutStage === 'final' && m.status === 'completed');
            if (finalMatch && finalMatch.winnerTeamId) {
                const champTeam = teamsMap[finalMatch.winnerTeamId];
                const runnerTeam = teamsMap[finalMatch.team1Id === finalMatch.winnerTeamId ? finalMatch.team2Id : finalMatch.team1Id];
                if (champTeam) {
                    [
                        champTeam.player1.id,
                        champTeam.player2.id
                    ].forEach((pId)=>{
                        if (statsMap[pId]) {
                            statsMap[pId].recentEvents.set(event.id, {
                                eventId: event.id,
                                eventName: event.name,
                                date: event.date,
                                result: 'Champion'
                            });
                        }
                    });
                }
                if (runnerTeam) {
                    [
                        runnerTeam.player1.id,
                        runnerTeam.player2.id
                    ].forEach((pId)=>{
                        if (statsMap[pId]) {
                            statsMap[pId].recentEvents.set(event.id, {
                                eventId: event.id,
                                eventName: event.name,
                                date: event.date,
                                result: 'Runner-Up'
                            });
                        }
                    });
                }
            }
        }
    });
    return users.map((u)=>{
        const s = statsMap[u.id];
        if (!s) return u;
        const winRate = s.matchesPlayed > 0 ? Math.round(s.matchesWon / s.matchesPlayed * 100) : 0;
        const recentList = Array.from(s.recentEvents.values());
        return {
            ...u,
            eventsPlayed: s.eventsPlayed.size,
            matchesPlayed: s.matchesPlayed,
            matchesWon: s.matchesWon,
            matchesLost: s.matchesLost,
            winRate,
            totalGamesWon: s.totalGamesWon,
            totalGamesLost: s.totalGamesLost,
            recentEvents: recentList.length > 0 ? recentList : u.recentEvents || []
        };
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/scheduling.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateRoundRobinFixtures",
    ()=>generateRoundRobinFixtures
]);
function generateRoundRobinFixtures(eventId, groups, availableCourtIds, courtNamesMap) {
    const matches = [];
    let matchCounter = 1;
    groups.forEach((group, groupIdx)=>{
        const { teamIds } = group;
        if (teamIds.length < 4) return;
        // Pick 2 courts for this group based on group index or available pool
        const hasCourts = availableCourtIds && availableCourtIds.length > 0;
        const court1Id = hasCourts ? availableCourtIds[groupIdx * 2 % availableCourtIds.length] || availableCourtIds[0] : '';
        const court2Id = hasCourts ? availableCourtIds[(groupIdx * 2 + 1) % availableCourtIds.length] || availableCourtIds[0] : '';
        const c1Name = court1Id ? courtNamesMap[court1Id] || 'Court' : 'Court TBD';
        const c2Name = court2Id ? courtNamesMap[court2Id] || 'Court' : 'Court TBD';
        const [A, B, C, D] = teamIds;
        // Round 1
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 1,
            courtId: court1Id,
            courtName: c1Name,
            team1Id: A,
            team2Id: B,
            status: 'scheduled'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 1,
            courtId: court2Id,
            courtName: c2Name,
            team1Id: C,
            team2Id: D,
            status: 'scheduled'
        });
        // Round 2
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 2,
            courtId: court1Id,
            courtName: c1Name,
            team1Id: A,
            team2Id: C,
            status: 'scheduled'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 2,
            courtId: court2Id,
            courtName: c2Name,
            team1Id: B,
            team2Id: D,
            status: 'scheduled'
        });
        // Round 3
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 3,
            courtId: court1Id,
            courtName: c1Name,
            team1Id: A,
            team2Id: D,
            status: 'scheduled'
        });
        matches.push({
            id: `match_${eventId}_${matchCounter++}`,
            eventId,
            stage: 'group',
            groupId: group.id,
            round: 3,
            courtId: court2Id,
            courtName: c2Name,
            team1Id: B,
            team2Id: C,
            status: 'scheduled'
        });
    });
    return matches;
} /**
 * 4. Group Table & Standings Recalculation Logic
 * Dynamically computes standings from raw completed match scores.
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/standings.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateGroupStandings",
    ()=>calculateGroupStandings,
    "identifyQualifiers",
    ()=>identifyQualifiers
]);
function calculateGroupStandings(group, matches, teamsMap, rules) {
    const standingsMap = {};
    // Initialize standings for all teams in group
    group.teamIds.forEach((teamId)=>{
        const team = teamsMap[teamId];
        const teamName = team ? team.name : 'Team';
        const playerNames = team ? `${team.player1.displayName} & ${team.player2.displayName}` : 'TBD';
        standingsMap[teamId] = {
            teamId,
            teamName,
            playerNames,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            gamesFor: 0,
            gamesAgainst: 0,
            difference: 0,
            points: 0,
            qualified: false
        };
    });
    // Filter completed group matches for this group
    const groupMatches = matches.filter((m)=>m.groupId === group.id && m.stage === 'group' && m.status === 'completed');
    groupMatches.forEach((m)=>{
        const t1 = standingsMap[m.team1Id];
        const t2 = standingsMap[m.team2Id];
        if (!t1 || !t2 || typeof m.team1Score !== 'number' || typeof m.team2Score !== 'number') {
            return;
        }
        t1.played += 1;
        t2.played += 1;
        let games1 = m.team1Score;
        let games2 = m.team2Score;
        if (m.sets && m.sets.length > 0) {
            games1 = m.sets.reduce((sum, s)=>sum + (s.team1Score || 0), 0);
            games2 = m.sets.reduce((sum, s)=>sum + (s.team2Score || 0), 0);
        }
        t1.gamesFor += games1;
        t1.gamesAgainst += games2;
        t2.gamesFor += games2;
        t2.gamesAgainst += games1;
        const winnerId = m.winnerTeamId || (m.team1Score > m.team2Score ? m.team1Id : m.team2Score > m.team1Score ? m.team2Id : undefined);
        if (winnerId === m.team1Id) {
            t1.won += 1;
            t1.points += rules.winPoints;
            t2.lost += 1;
            t2.points += rules.lossPoints;
        } else if (winnerId === m.team2Id) {
            t2.won += 1;
            t2.points += rules.winPoints;
            t1.lost += 1;
            t1.points += rules.lossPoints;
        } else {
            t1.drawn += 1;
            t1.points += rules.drawPoints;
            t2.drawn += 1;
            t2.points += rules.drawPoints;
        }
    });
    // Calculate difference
    Object.values(standingsMap).forEach((st)=>{
        st.difference = st.gamesFor - st.gamesAgainst;
    });
    // Sort by tiebreak order
    const standingsList = Object.values(standingsMap);
    standingsList.sort((a, b)=>{
        for (const criterion of rules.tiebreakOrder){
            if (criterion === 'points' && b.points !== a.points) {
                return b.points - a.points;
            }
            if (criterion === 'matchesWon' && b.won !== a.won) {
                return b.won - a.won;
            }
            if (criterion === 'scoreDiff' && b.difference !== a.difference) {
                return b.difference - a.difference;
            }
            if (criterion === 'scoreFor' && b.gamesFor !== a.gamesFor) {
                return b.gamesFor - a.gamesFor;
            }
        }
        return 0;
    });
    // Tag top N as qualified
    for(let i = 0; i < rules.qualifiersPerGroup && i < standingsList.length; i++){
        standingsList[i].qualified = true;
    }
    return standingsList;
}
function identifyQualifiers(groups, matches, teamsMap, rules) {
    const qualifiers = [];
    groups.forEach((group)=>{
        const standings = calculateGroupStandings(group, matches, teamsMap, rules);
        standings.filter((s)=>s.qualified).forEach((s, idx)=>{
            const team = teamsMap[s.teamId];
            if (team) {
                qualifiers.push({
                    groupName: group.name,
                    position: idx + 1,
                    team
                });
            }
        });
    });
    // A three-group tournament produces six automatic qualifiers (the top two
    // in each group). Fill an eight-team quarter-final bracket with the two best
    // third-place teams, ranked by the tournament's configured tie-break order.
    const remainingQuarterFinalSpots = Math.max(0, 8 - qualifiers.length);
    if (groups.length >= 3 && remainingQuarterFinalSpots > 0) {
        const thirdPlacedTeams = groups.flatMap((group)=>{
            const standing = calculateGroupStandings(group, matches, teamsMap, rules)[2];
            const team = standing ? teamsMap[standing.teamId] : undefined;
            return standing && team ? [
                {
                    groupName: group.name,
                    standing,
                    team
                }
            ] : [];
        });
        thirdPlacedTeams.sort((a, b)=>{
            for (const criterion of rules.tiebreakOrder){
                if (criterion === 'points' && b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
                if (criterion === 'matchesWon' && b.standing.won !== a.standing.won) return b.standing.won - a.standing.won;
                if (criterion === 'scoreDiff' && b.standing.difference !== a.standing.difference) return b.standing.difference - a.standing.difference;
                if (criterion === 'scoreFor' && b.standing.gamesFor !== a.standing.gamesFor) return b.standing.gamesFor - a.standing.gamesFor;
            }
            return a.groupName.localeCompare(b.groupName);
        });
        thirdPlacedTeams.slice(0, remainingQuarterFinalSpots).forEach(({ groupName, team })=>{
            qualifiers.push({
                groupName,
                position: 3,
                team
            });
        });
    }
    return qualifiers;
} /**
 * 6. Knockout Bracket Generation
 * Generates Quarter-Finals, Semi-Finals, and Final
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/domain/tournament/teams.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateTeamsFromParticipants",
    ()=>generateTeamsFromParticipants
]);
function generateTeamsFromParticipants(eventId, participants, partnerRequests, existingTeamsMap = {}) {
    const confirmedParticipants = participants.filter((p)=>p.status === 'confirmed');
    const usedParticipantIds = new Set();
    const teams = [];
    // Keep existing locked teams if valid
    Object.values(existingTeamsMap).forEach((team)=>{
        if (team.locked) {
            teams.push(team);
            usedParticipantIds.add(team.player1.id);
            usedParticipantIds.add(team.player2.id);
        }
    });
    const availableParticipants = confirmedParticipants.filter((p)=>!usedParticipantIds.has(p.id));
    // Priority 1: Mutual accepted partner requests
    const acceptedRequests = partnerRequests.filter((r)=>r.eventId === eventId && r.status === 'accepted');
    let teamCounter = teams.length + 1;
    for (const req of acceptedRequests){
        if (usedParticipantIds.has(req.fromUserId) || usedParticipantIds.has(req.toUserId)) {
            continue;
        }
        const p1 = availableParticipants.find((p)=>p.id === req.fromUserId);
        const p2 = availableParticipants.find((p)=>p.id === req.toUserId);
        if (p1 && p2) {
            teams.push({
                id: `team_${eventId}_${Date.now()}_${teamCounter}`,
                eventId,
                name: `Team ${String(teamCounter).padStart(2, '0')}`,
                player1: {
                    id: p1.id,
                    displayName: p1.displayName,
                    isGuest: p1.isGuest
                },
                player2: {
                    id: p2.id,
                    displayName: p2.displayName,
                    isGuest: p2.isGuest
                },
                locked: false
            });
            usedParticipantIds.add(p1.id);
            usedParticipantIds.add(p2.id);
            teamCounter++;
        }
    }
    // Also check non-accepted direct selections if both selected each other
    const remaining = availableParticipants.filter((p)=>!usedParticipantIds.has(p.id));
    for(let i = 0; i < remaining.length; i++){
        const p1 = remaining[i];
        if (usedParticipantIds.has(p1.id) || !p1.preferredPartnerId) continue;
        const p2 = remaining.find((p)=>p.id === p1.preferredPartnerId && !usedParticipantIds.has(p.id) && (p.preferredPartnerId === p1.id || true) // Pair if available
        );
        if (p2 && p2.id !== p1.id) {
            teams.push({
                id: `team_${eventId}_${Date.now()}_${teamCounter}`,
                eventId,
                name: `Team ${String(teamCounter).padStart(2, '0')}`,
                player1: {
                    id: p1.id,
                    displayName: p1.displayName,
                    isGuest: p1.isGuest
                },
                player2: {
                    id: p2.id,
                    displayName: p2.displayName,
                    isGuest: p2.isGuest
                },
                locked: false
            });
            usedParticipantIds.add(p1.id);
            usedParticipantIds.add(p2.id);
            teamCounter++;
        }
    }
    // Priority 2: Auto-pair remaining players
    const stillUnpaired = confirmedParticipants.filter((p)=>!usedParticipantIds.has(p.id));
    for(let i = 0; i < stillUnpaired.length; i += 2){
        const p1 = stillUnpaired[i];
        const p2 = stillUnpaired[i + 1];
        if (p1 && p2) {
            teams.push({
                id: `team_${eventId}_${Date.now()}_${teamCounter}`,
                eventId,
                name: `Team ${String(teamCounter).padStart(2, '0')}`,
                player1: {
                    id: p1.id,
                    displayName: p1.displayName,
                    isGuest: p1.isGuest
                },
                player2: {
                    id: p2.id,
                    displayName: p2.displayName,
                    isGuest: p2.isGuest
                },
                locked: false
            });
            usedParticipantIds.add(p1.id);
            usedParticipantIds.add(p2.id);
            teamCounter++;
        }
    }
    return teams;
} /**
 * 2. Group Generation Logic
 * Divide teams into groups of 4 teams per group
 */ 
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createBrowserClient.js [app-client] (ecmascript)");
;
function createClient() {
    const supabaseUrl = ("TURBOPACK compile-time value", "https://ezkpbsiudmabtunobtan.supabase.co") || 'https://placeholder.supabase.co';
    const supabaseKey = ("TURBOPACK compile-time value", "sb_publishable_4ARRRQHn7jYmF04v11c7Iw_GOTysjEk") || 'placeholder-key';
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createBrowserClient$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createBrowserClient"])(supabaseUrl, supabaseKey, {
        // Auth listeners and callers should share one browser client. Creating a
        // client per action duplicates internal state and subscription work.
        isSingleton: true
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/engine.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
// Compatibility barrel for the tournament domain.
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$teams$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/teams.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$groups$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/groups.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$scheduling$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/scheduling.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$standings$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/standings.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$knockout$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/knockout.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$domain$2f$tournament$2f$playerStats$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/domain/tournament/playerStats.ts [app-client] (ecmascript)");
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_10o5byo._.js.map