import React, { useCallback, useEffect, useState } from 'react';
import { FileClock, RefreshCw, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatGymDateTime } from '../../utils/dateTime';
import Pagination from '../Pagination/Pagination';
import { useTranslation } from 'react-i18next';

interface AuditActor {
  _id: string;
  username: string;
  role: string;
}

interface AuditLogEntry {
  _id: string;
  action: string;
  entity: string;
  entityId: string;
  actorUserId?: AuditActor | string;
  requestId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: string;
}

interface AuditResponse {
  data: AuditLogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

const formatSnapshot = (value: Record<string, unknown> | undefined, emptyLabel: string) =>
  value ? JSON.stringify(value, null, 2) : emptyLabel;

const AuditLogViewer: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 20,
  });

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<AuditResponse>('/audit-logs', {
        params: {
          page,
          limit,
          ...(action ? { action } : {}),
          ...(entity ? { entity } : {}),
        },
      });
      setLogs(response.data.data);
      setPagination(response.data.pagination);
    } catch (error: any) {
      toast.error(error.message || t('ui.audit_load_failed'));
    } finally {
      setLoading(false);
    }
  }, [action, entity, limit, page, t]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="min-h-screen bg-gray-950 p-6 text-white lg:p-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-extrabold">
            <FileClock className="h-8 w-8 text-blue-400" />
            {t('ui.audit_title')}
          </h1>
          <p className="mt-2 text-sm text-gray-400">{t('ui.audit_subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={loadLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-600/10 px-4 py-2 text-sm font-bold text-blue-400 transition hover:bg-blue-600 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> {t('ui.refresh')}
        </button>
      </div>

      <div className="mb-6 grid gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4 sm:grid-cols-2">
        <input
          value={action}
          onChange={(event) => { setAction(event.target.value); setPage(1); }}
          placeholder={t('ui.filter_action')}
          className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
        <input
          value={entity}
          onChange={(event) => { setEntity(event.target.value); setPage(1); }}
          placeholder={t('ui.filter_entity')}
          className="rounded-xl border border-gray-700 bg-gray-950 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gray-900">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{t('ui.loading_audit')}</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">{t('ui.no_audit_records')}</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => {
              const actor = typeof log.actorUserId === 'object' ? log.actorUserId : undefined;
              return (
                <article key={log._id} className="p-5 hover:bg-white/[0.02]">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-sm font-bold text-blue-300">{log.action}</span>
                        <span className="text-sm text-gray-300">{log.entity} · {log.entityId}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        {actor ? `${actor.username} (${actor.role})` : String(log.actorUserId || t('ui.system'))}
                        {log.requestId ? ` · ${t('ui.request', { id: log.requestId })}` : ''}
                      </div>
                    </div>
                    <time className="text-xs text-gray-500" dateTime={log.createdAt}>
                      {formatGymDateTime(log.createdAt)}
                    </time>
                  </div>

                  <details className="mt-4 rounded-xl border border-gray-800 bg-gray-950/60">
                    <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-300">{t('ui.view_change_data')}</summary>
                    <div className="grid gap-4 border-t border-gray-800 p-4 lg:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-red-300">{t('ui.before')}</p>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 text-xs text-gray-300">{formatSnapshot(log.before, t('ui.no_snapshot'))}</pre>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-green-300">{t('ui.after')}</p>
                        <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-black/30 p-3 text-xs text-gray-300">{formatSnapshot(log.after, t('ui.no_snapshot'))}</pre>
                      </div>
                    </div>
                  </details>
                </article>
              );
            })}
          </div>
        )}

        {pagination.totalItems > 0 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            onPageChange={setPage}
            onItemsPerPageChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogViewer;
