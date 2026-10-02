'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

function attachmentsOf(message: TicketMessage): { id: string; fileName: string }[] {
  if (!message.conditions) return [];
  try {
    const parsed = JSON.parse(message.conditions);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface TicketMessage {
  decision: string;
  comments: string | null;
  conditions?: string | null;
  reviewedAt: string;
  reviewer: { name: string; role?: string };
}

export function TicketThread({
  applicationId,
  messages,
  onPosted,
  canRequestFiles = false,
}: {
  applicationId: string;
  messages: TicketMessage[];
  onPosted?: (messages: TicketMessage[]) => void;
  canRequestFiles?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState(messages);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [notice, setNotice] = useState('');

  const latest = [...items].reverse().find((item) =>
    ['MESSAGE', 'DOCUMENT_REQUEST', 'DOCUMENTS_RECEIVED'].includes(item.decision)
  );
  const action =
    latest?.decision === 'DOCUMENT_REQUEST'
      ? 'Waiting on applicant — upload files'
      : latest?.decision === 'DOCUMENTS_RECEIVED' || latest?.reviewer.role === 'SME'
        ? 'Waiting on underwriter'
        : latest
          ? 'Waiting on applicant'
          : 'Open';

  const send = async (kind: 'MESSAGE' | 'DOCUMENT_REQUEST', picked?: File[], preset?: string) => {
    const outgoing = picked ?? files;
    const note = preset ?? text.trim();
    if (!note && outgoing.length === 0) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const form = new FormData();
      form.set('message', note);
      form.set('kind', kind);
      outgoing.forEach((file) => form.append('files', file));
      const res = await fetch(`/api/applications/${applicationId}/messages`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not send message');
      setText('');
      setFiles([]);
      setItems(data.reviews);
      setNotice('Sent. An email notice went to the other desk.');
      onPosted?.(data.reviews);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">Application ticket</h2>
          <p className="mt-1 text-sm text-[#475569]">Same thread shown here and in dashboard notifications.</p>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">{action}</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.length === 0 && <p className="text-sm text-[#475569]">No messages yet.</p>}
        {items.map((message, index) => {
          const isApplicant = message.reviewer.role === 'SME';
          return (
            <article
              key={`${message.reviewedAt}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                isApplicant ? 'bg-[#F7F9FC] text-[#0F172A]' : 'ml-auto bg-[#0B1F4D] text-white'
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-4 text-xs opacity-80">
                <span>{message.reviewer.name}</span>
                <span>{new Date(message.reviewedAt).toLocaleString()}</span>
              </div>
              {message.decision === 'DOCUMENT_REQUEST' && (
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide">File request</p>
              )}
              {message.decision !== 'MESSAGE' && message.decision !== 'DOCUMENT_REQUEST' && (
                <p className="mb-1 text-xs font-medium uppercase tracking-wide">{message.decision.replace(/_/g, ' ')}</p>
              )}
              {message.comments && <p>{message.comments}</p>}
              {message.decision === 'DOCUMENT_REQUEST' && !canRequestFiles && (
                <label className="mt-3 inline-flex cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[#0B1F4D]">
                  {busy ? 'Uploading...' : 'Upload files'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    disabled={busy}
                    onChange={(e) => {
                      const picked = e.target.files ? Array.from(e.target.files) : [];
                      e.target.value = '';
                      void send('MESSAGE', picked, message.comments || 'Uploaded requested files');
                    }}
                  />
                </label>
              )}
              {attachmentsOf(message).map((file) => (
                <a
                  key={file.id}
                  href={`/api/documents/${file.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-2 block text-xs underline ${isApplicant ? 'text-[#1D4ED8]' : 'text-white'}`}
                >
                  {file.fileName}
                </a>
              ))}
            </article>
          );
        })}
      </div>
      <div className="mt-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Write a reply"
          className="w-full rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm"
        />
        {files.length > 0 && (
          <p className="mt-2 text-xs text-[#475569]">{files.map((file) => file.name).join(', ')}</p>
        )}
        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
        {notice && <p className="mt-2 text-sm text-emerald-700">{notice}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center rounded-xl border border-[#E2E8F0] px-4 py-2 text-sm font-medium">
            Attach file
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                setFiles(e.target.files ? Array.from(e.target.files) : []);
                e.target.value = '';
              }}
            />
          </label>
          <Button onClick={() => send('MESSAGE')} disabled={busy || (!text.trim() && files.length === 0)}>
            {busy ? 'Sending...' : 'Send reply'}
          </Button>
          {canRequestFiles && (
            <Button variant="outline" onClick={() => send('DOCUMENT_REQUEST')} disabled={busy || !text.trim()}>
              Request files
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
