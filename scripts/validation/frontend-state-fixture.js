// Browser-only QA fixtures. Never imported by the application or production entry.
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import LocaleProvider from '/src/context/LocaleProvider.jsx'
import AiPlanCard from '/src/components/ai/AiPlanCard.jsx'
import ProposalCard from '/src/components/ai/ProposalCard.jsx'
import ChatComposer from '/src/components/ai/ChatComposer.jsx'
import ChatThinking from '/src/components/ai/ChatThinking.jsx'
import ChatMessage from '/src/components/ai/ChatMessage.jsx'
import ChatSendError from '/src/components/ai/ChatSendError.jsx'
import AdminDataTable from '/src/components/admin/AdminDataTable.jsx'
import useAiAssistant from '/src/hooks/useAiAssistant.js'
import aiService from '/src/services/aiService.js'
import config from '/src/config/index.js'
import { normalizeAiProposal, normalizeAiConversation } from '/src/models/ai.js'
import { ADMIN_COLLECTIONS } from '/src/models/adminPlatform.js'
const h=React.createElement
const context={workspaceId:'qa-workspace',siteId:'qa-site',activePageId:'qa-page',currentTheme:'modern'}
const fixtureProposal={id:'qa-proposal',action:'addSection',description:'QA fixture only: add a sample pricing section.',fields:{sectionType:'pricing'},status:'pending'}
function HookFixture(){
 const ai=useAiAssistant('qa-workspace',{context})
 useEffect(()=>{window.auditAi=ai},[ai])
 return h('section',null,h('p',null,'TEST FIXTURES: no provider or backend is running.'),h('button',{id:'qa-new',onClick:()=>ai.selectConversation(null)},'New conversation'),h('output',{id:'qa-count'},ai.messages.length),ai.isSending&&h(ChatThinking),ai.messages.map(m=>h(ChatMessage,{key:m.id,message:m})),h(ChatComposer,{draft:ai.draft,onDraftChange:ai.setDraft,onSend:ai.send,isSending:ai.isSending}),ai.sendError&&h(ChatSendError,{message:ai.sendError,onRetry:ai.retrySend,canRetry:true}),ai.proposals.map(p=>h(ProposalCard,{key:p.key,proposal:p,context,onApply:()=>ai.applyProposal(p),onReject:()=>ai.rejectProposal(p)})),h('button',{id:'qa-undo',disabled:!ai.canUndo,onClick:ai.undoLastChange},'Undo'),ai.actionError&&h('p',{role:'alert'},ai.actionError),ai.undoNotice&&h('p',{id:'qa-undo-notice'},ai.undoNotice.message))
}
const markApplied = () => { window.auditApplied = true }
const markRejected = () => { window.auditRejected = true }
const markRetried = () => { window.auditRetried = true }
function Fixture(){const [state,setState]=useState({kind:'plan',payload:{tier:'free',used:12,limit:50}});useEffect(()=>{window.setAuditFixture=setState},[])
 if(state.kind==='hook')return h(HookFixture)
 if(state.kind==='proposal')return h(ProposalCard,{proposal:normalizeAiProposal({...fixtureProposal,...state.proposal}),context:state.context??context,onApply:markApplied,onReject:markRejected})
 if(state.kind==='admin')return h(AdminDataTable,{section:state.section,columns:ADMIN_COLLECTIONS[state.section],rows:state.rows??[],state:state.status??'ready',onRetry:markRetried})
 return h('div',null,h(AiPlanCard,{payload:state.payload}),h(ChatComposer,{draft:'Create a modern SaaS landing page.',onDraftChange:()=>{},onSend:()=>{},isLimitReached:state.limitReached}))
}
export function mount(){
 const host=document.createElement('main');host.id='audit-fixture';host.style.cssText='position:fixed;inset:0;z-index:99999;overflow:auto;padding:24px;background:var(--color-bg);';document.body.append(host)
 const root=createRoot(host);root.render(h(MemoryRouter,null,h(LocaleProvider,null,h(Fixture))))
 const previous={...aiService};const url=config.api.baseUrl
 return ()=>{root.unmount();host.remove();Object.assign(aiService,previous);config.api.baseUrl=url}
}
export function enableHookFixtures(){config.api.baseUrl='https://qa.invalid';aiService.getConversation=async()=>normalizeAiConversation({id:'qa-thread',messages:[{id:'qa-message',role:'assistant',content:'QA fixture: a proposal to review.',proposals:[fixtureProposal]}]});aiService.getConversations=async()=>[{id:'qa-thread',title:'QA history',isActive:true}];aiService.getSuggestions=async()=>[];aiService.sendAiMessage=async()=>{await new Promise(r=>setTimeout(r,350));throw Error('QA simulated service error')};aiService.applyAiAction=async()=>{throw Error('QA simulated apply failure')}}
export function permitFixtureApply(){aiService.applyAiAction=async()=>({id:'qa-result'})}
