import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, Check, CheckCircle2, ChevronDown, Circle, Clock3, Code2, ExternalLink, FileCode2, FilePlus2, FolderGit2, Github, Loader2, LockKeyhole, LogOut, Play, Plus, RefreshCw, Save, Sparkles, UploadCloud, X } from 'lucide-react';
import { githubApi, projectStarterFiles, type GitHubRepository, type GitHubTreeEntry, type GitHubUser } from '../api/githubApi';
import { planApi } from '../api/planApi';
import { verificationApi } from '../api/verificationApi';
import useAppStore from '../hooks/useAppStore';

const MonacoEditor = lazy(() => import('@monaco-editor/react'));

interface WorkspaceFile { content: string; savedContent: string }
interface Notice { type: 'success' | 'error' | 'info'; message: string }

const ignoredFile = (file: GitHubTreeEntry) => file.type !== 'blob'
  || (file.size ?? 0) > 450_000
  || /(^|\/)(node_modules|\.git|target|dist|build)\//.test(file.path)
  || /\.(png|jpe?g|gif|webp|ico|pdf|zip|jar|class|woff2?|ttf|lock)$/i.test(file.path);

function parseRepoUrl(value: string) {
  const match = value.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?\/?$/i);
  return match ? { owner: match[1], repo: match[2] } : null;
}

function detectLanguage(path: string) {
  const extension = path.split('.').pop()?.toLowerCase();
  const languages: Record<string, string> = { ts: 'typescript', tsx: 'typescript', js: 'javascript', jsx: 'javascript', java: 'java', py: 'python', html: 'html', css: 'css', json: 'json', xml: 'xml', md: 'markdown', yml: 'yaml', yaml: 'yaml', sql: 'sql', sh: 'shell', properties: 'properties', kt: 'kotlin', go: 'go', rs: 'rust' };
  return languages[extension || ''] || 'plaintext';
}

function makePreview(files: Record<string, WorkspaceFile>) {
  const entry = files['index.html']?.content;
  if (!entry) return '';
  const styles = files['src/style.css']?.content || files['style.css']?.content || '';
  const script = files['src/main.js']?.content || files['main.js']?.content || '';
  return entry
    .replace(/<link\b[^>]*href=["'][^"']*(?:style\.css|\.css)["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*src=["'][^"']*(?:main\.js|\.js)["'][^>]*><\/script>/gi, '')
    .replace('</head>', `<style>${styles.replace(/<\/style/gi, '<\\/style')}</style></head>`)
    .replace('</body>', `<script>${script.replace(/<\/script/gi, '<\\/script')}</script></body>`);
}

const Workspace = () => {
  const { currentPlan, repoUrl, setRepoUrl, milestones, updateMilestoneStatus } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [tree, setTree] = useState<GitHubTreeEntry[]>([]);
  const [files, setFiles] = useState<Record<string, WorkspaceFile>>({});
  const [activePath, setActivePath] = useState('');
  const [busy, setBusy] = useState(false);
  const [loadingPath, setLoadingPath] = useState('');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [repoName, setRepoName] = useState((currentPlan?.title || 'my-learning-project').toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, ''));
  const [repoPrivate, setRepoPrivate] = useState(true);
  const [newPath, setNewPath] = useState('');
  const [commitMessage, setCommitMessage] = useState('Build in Buildspace');
  const [preview, setPreview] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mobileFilesOpen, setMobileFilesOpen] = useState(false);

  const activeMilestone = useMemo(() => milestones?.find((milestone) => !milestone.completed) || milestones?.[milestones.length - 1], [milestones]);
  const dirtyFiles = useMemo(() => Object.entries(files).filter(([, file]) => file.content !== file.savedContent).map(([path]) => path), [files]);
  const canPreview = Boolean(files['index.html']);

  const loadRepository = useCallback(async (repo: GitHubRepository) => {
    setBusy(true); setNotice(null); setRepository(repo); setFiles({}); setTree([]); setActivePath(''); setPreview(false);
    try {
      const result = await githubApi.getTree(repo.full_name.split('/')[0], repo.name, repo.default_branch);
      if (result.truncated) setNotice({ type: 'info', message: 'This repository has a very large file tree; only supported source files are shown.' });
      const visible = result.tree.filter((file) => !ignoredFile(file)).sort((a, b) => a.path.localeCompare(b.path));
      setTree(visible);
      if (visible.length) {
        const first = visible.find((file) => file.path === 'README.md') || visible.find((file) => /\.(java|js|ts|tsx|jsx|html|py|css|json)$/i.test(file.path)) || visible[0];
        setLoadingPath(first.path);
        const content = await githubApi.getBlob(repo.full_name.split('/')[0], repo.name, first.sha);
        setFiles({ [first.path]: { content, savedContent: content } });
        setActivePath(first.path);
        setLoadingPath('');
      }
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not open this repository.' });
      setRepository(null);
    } finally { setLoadingPath(''); setBusy(false); }
  }, []);

  const refreshGitHub = useCallback(async () => {
    try {
      const user = await githubApi.getUser();
      setGithubUser(user);
      const repos = await githubApi.listRepositories();
      setRepositories(repos);
      const linked = parseRepoUrl(repoUrl);
      if (linked) {
        const found = repos.find((repo) => repo.full_name.toLowerCase() === `${linked.owner}/${linked.repo}`.toLowerCase());
        if (found) await loadRepository(found);
      }
    } catch (error) {
      if (error instanceof Error && !error.message.includes('Connect your GitHub')) setNotice({ type: 'error', message: error.message });
    }
  }, [loadRepository, repoUrl]);

  useEffect(() => {
    const result = searchParams.get('github');
    if (result) {
      const messages: Record<string, Notice> = {
        connected: { type: 'success', message: 'GitHub is connected. Pick a repository or create a new one.' },
        'setup-required': { type: 'error', message: 'GitHub sign-in needs to be configured for this deployment.' },
        'state-error': { type: 'error', message: 'GitHub sign-in could not be verified. Please try again.' },
        'auth-error': { type: 'error', message: 'GitHub sign-in did not finish. Please try again.' },
      };
      setNotice(messages[result] || null);
      setSearchParams({}, { replace: true });
    }
    void refreshGitHub();
  }, [refreshGitHub, searchParams, setSearchParams]);

  const selectRepository = async (repo: GitHubRepository) => {
    if (!currentPlan) { setNotice({ type: 'error', message: 'Create a learning plan before attaching a repository.' }); return; }
    setBusy(true);
    try {
      const url = `https://github.com/${repo.full_name}`;
      await planApi.updateGitubUrl(currentPlan.id, url);
      setRepoUrl(url);
      await loadRepository(repo);
      setNotice({ type: 'success', message: 'Repository connected to this learning plan.' });
    } catch (error) { setBusy(false); setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not connect repository.' }); }
  };

  const createRepository = async () => {
    if (!currentPlan || !repoName.trim()) return;
    setBusy(true); setNotice(null);
    try {
      const created = await githubApi.createRepository(repoName.trim(), currentPlan.projectDescription || currentPlan.title, repoPrivate);
      const starter = projectStarterFiles({ title: currentPlan.title, tech: currentPlan.tech, projectDescription: currentPlan.projectDescription });
      const branch = created.default_branch || 'main';
      await githubApi.initializeRepository(githubUser!.login, created.name, branch, starter, 'Start project from Buildspace');
      const initialized = { ...created, default_branch: branch };
      setRepositories((items) => [initialized, ...items]);
      setCreateOpen(false);
      await selectRepository(initialized);
      setNotice({ type: 'success', message: 'Your project repository is ready. Edit files and publish whenever you’re ready.' });
    } catch (error) { setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not create this repository.' }); }
    finally { setBusy(false); }
  };

  const openFile = async (entry: GitHubTreeEntry) => {
    setMobileFilesOpen(false); setPreview(false); setActivePath(entry.path);
    if (files[entry.path]) return;
    setLoadingPath(entry.path);
    try {
      const content = await githubApi.getBlob(repository!.full_name.split('/')[0], repository!.name, entry.sha);
      setFiles((current) => ({ ...current, [entry.path]: { content, savedContent: content } }));
    } catch (error) { setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not open this file.' }); }
    finally { setLoadingPath(''); }
  };

  const addFile = () => {
    const path = newPath.trim().replace(/^\/+/, '');
    if (!path || path.split('/').some((part) => part === '..') || files[path]) return;
    setFiles((current) => ({ ...current, [path]: { content: '', savedContent: '' } }));
    setTree((current) => [...current, { path, sha: '', mode: '100644', type: 'blob', size: 0 }].sort((a, b) => a.path.localeCompare(b.path)));
    setActivePath(path); setNewPath('');
  };

  const publish = async () => {
    if (!repository || !dirtyFiles.length) return;
    setBusy(true); setNotice(null);
    try {
      const changes = Object.fromEntries(dirtyFiles.map((path) => [path, files[path].content]));
      const sha = await githubApi.commitFiles(repository.full_name.split('/')[0], repository.name, repository.default_branch, changes, commitMessage.trim() || 'Update project from Buildspace');
      setFiles((current) => Object.fromEntries(Object.entries(current).map(([path, file]) => [path, { ...file, savedContent: file.content }])));
      setNotice({ type: 'success', message: `Published ${dirtyFiles.length} file${dirtyFiles.length === 1 ? '' : 's'} to GitHub (${sha.slice(0, 7)}).` });
      return true;
    } catch (error) {
      setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not publish these changes.' });
      return false;
    } finally { setBusy(false); }
  };

  const collectReviewSnapshot = async () => {
    const relevant = tree.filter((entry) => /\.(java|kt|js|jsx|ts|tsx|py|go|rs|html|css|json|xml|md|yml|yaml|properties|sql|txt)$/i.test(entry.path)
      && !/(package-lock|pnpm-lock|yarn\.lock|\.min\.)/i.test(entry.path)
      && (entry.size ?? 0) <= 40_000).slice(0, 40);
    const snapshot: Record<string, string> = {};
    for (let index = 0; index < relevant.length; index += 4) {
      const batch = relevant.slice(index, index + 4);
      const owner = repository!.full_name.split('/')[0];
      const contents = await Promise.all(batch.map(async (entry) => [entry.path, files[entry.path]?.content ?? await githubApi.getBlob(owner, repository!.name, entry.sha)] as const));
      for (const [path, content] of contents) {
        if (content.length > 0 && Object.values(snapshot).reduce((size, value) => size + value.length, 0) + content.length <= 96_000) snapshot[path] = content;
      }
    }
    for (const [path, file] of Object.entries(files)) {
      if (file.content !== file.savedContent && !snapshot[path] && Object.values(snapshot).reduce((size, value) => size + value.length, 0) + file.content.length <= 96_000) snapshot[path] = file.content;
    }
    if (!Object.keys(snapshot).length) throw new Error('No supported project source files were found to review.');
    return snapshot;
  };

  const verifyMilestone = async () => {
    if (!repository || !activeMilestone) return;
    setChecking(true); setNotice(null);
    try {
      if (dirtyFiles.length) {
        const committed = await publish();
        if (!committed) return;
      }
      const sourceSnapshot = await collectReviewSnapshot();
      const result = await verificationApi.verifyMilestone(activeMilestone.id, sourceSnapshot);
      setNotice({ type: result.completed ? 'success' : 'info', message: result.feedback });
      if (result.completed) updateMilestoneStatus(activeMilestone.id, true);
    } catch (error) { setNotice({ type: 'error', message: error instanceof Error ? error.message : 'Could not check this milestone.' }); }
    finally { setChecking(false); }
  };

  const disconnect = async () => {
    await githubApi.disconnect();
    setGithubUser(null); setRepositories([]); setRepository(null); setFiles({}); setTree([]); setActivePath(''); setRepoUrl('');
    setNotice({ type: 'info', message: 'GitHub was disconnected from this browser.' });
  };

  const previewHtml = useMemo(() => makePreview(files), [files]);
  const groupedEntries = useMemo(() => {
    const folders = new Set<string>();
    tree.forEach((entry) => entry.path.split('/').slice(0, -1).forEach((_, index, parts) => folders.add(parts.slice(0, index + 1).join('/'))));
    return { folders: [...folders].sort(), files: tree };
  }, [tree]);

  return <div className="space-y-5 pb-8">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Build and learn in one place</p><h1 className="page-heading mt-1">Project workspace</h1><p className="mt-1.5 text-sm text-slate-500">Edit your project, publish to GitHub, and check milestones without leaving Buildspace.</p></div>
      {githubUser && <button onClick={disconnect} className="button-secondary py-2 text-xs"><LogOut className="h-3.5 w-3.5" /> Disconnect {githubUser.login}</button>}
    </header>

    {notice && <div role={notice.type === 'error' ? 'alert' : 'status'} className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${notice.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : notice.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-indigo-100 bg-indigo-50 text-indigo-800'}`}><span className="mt-0.5 shrink-0">{notice.type === 'error' ? <AlertCircle className="h-4 w-4" /> : notice.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</span><span className="whitespace-pre-wrap">{notice.message}</span><button onClick={() => setNotice(null)} className="ml-auto rounded p-1 opacity-60 hover:opacity-100" aria-label="Dismiss message"><X className="h-3.5 w-3.5" /></button></div>}

    {!currentPlan ? <section className="surface px-6 py-14 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700"><Code2 className="h-6 w-6" /></div><h2 className="mt-4 text-xl font-extrabold text-slate-900">Start with a learning plan</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Your project workspace uses the active plan to create a ready-to-edit repository and check your milestones.</p><a href="/create-plan" className="button-primary mt-5">Create a learning plan <ArrowUpRight className="h-4 w-4" /></a></section>
      : !githubUser ? <section className="surface grid gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_330px] lg:items-center">
        <div><div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700"><Github className="h-3.5 w-3.5" /> GitHub integration</div><h2 className="mt-4 max-w-xl text-2xl font-extrabold leading-tight text-slate-900 sm:text-3xl">Your code, your repo, your learning path.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">Connect GitHub once. Then create a private project repo from this plan or open one you already have. Your files stay in your GitHub account.</p><button onClick={githubApi.connect} className="button-primary mt-6"><Github className="h-4 w-4" /> Connect GitHub <ArrowUpRight className="h-4 w-4" /></button><p className="mt-3 text-xs text-slate-400">Buildspace requests permission to read and write repositories so it can create your project and publish your edits.</p></div>
        <div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-indigo-300">Active learning plan</p><h3 className="mt-3 text-lg font-bold">{currentPlan.title}</h3><p className="mt-1 text-xs text-slate-400">{currentPlan.tech} · {currentPlan.skillLevel}</p><div className="my-5 h-px bg-white/10"/><p className="text-sm leading-6 text-slate-300">{currentPlan.projectDescription || 'Your milestones will guide the project as it grows.'}</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-emerald-300"><LockKeyhole className="h-3.5 w-3.5" /> New repositories start private</div></div>
      </section>
      : !repository ? <section className="space-y-5">
        <div className="surface flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><img src={githubUser.avatar_url} alt="" className="h-10 w-10 rounded-full"/><div><p className="text-sm font-bold text-slate-900">Connected as {githubUser.login}</p><p className="mt-1 text-xs text-slate-500">Choose an existing repository, or create a fresh project from this plan.</p></div></div><button onClick={() => void refreshGitHub()} className="button-secondary py-2 text-xs"><RefreshCw className="h-3.5 w-3.5" /> Refresh repositories</button></div>
        <div className="grid gap-4 lg:grid-cols-2"><button onClick={() => setCreateOpen(true)} className="group flex min-h-48 flex-col items-start justify-between rounded-2xl border border-indigo-200 bg-indigo-600 p-6 text-left text-white shadow-sm transition hover:bg-indigo-700"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Plus className="h-5 w-5" /></span><span><span className="block text-lg font-extrabold">Create a project repository</span><span className="mt-1 block max-w-sm text-sm leading-5 text-indigo-100">Buildspace creates your repo, adds a starter project, and links it to your milestones.</span></span><span className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold">Create repository <ArrowUpRight className="h-3.5 w-3.5" /></span></button>
          <div className="surface min-h-48 p-5"><div className="mb-4 flex items-center justify-between"><div><h2 className="text-base font-extrabold text-slate-900">Use an existing repository</h2><p className="mt-1 text-xs text-slate-500">Choose one you own or can edit.</p></div><FolderGit2 className="h-5 w-5 text-indigo-600" /></div>{repositories.length ? <div className="max-h-56 space-y-1 overflow-y-auto">{repositories.map((repo) => <button key={repo.id} disabled={busy} onClick={() => void selectRepository(repo)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50 disabled:opacity-50"><Github className="h-4 w-4 shrink-0 text-slate-400"/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-800">{repo.name}</span><span className="block truncate text-[11px] text-slate-400">{repo.description || repo.full_name}</span></span>{repo.private && <LockKeyhole className="h-3.5 w-3.5 text-slate-400"/>}<ArrowUpRight className="h-3.5 w-3.5 text-slate-300"/></button>)}</div> : <p className="rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">No repositories found. Create one to get started.</p>}</div>
        </div>
      </section>
      : <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700"><Code2 className="h-4 w-4"/></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-x-2"><h2 className="truncate text-sm font-extrabold text-slate-900">{repository.name}</h2><span className="hidden text-slate-300 sm:inline">/</span><a href={repository.html_url} target="_blank" rel="noreferrer" className="hidden items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-700 sm:inline-flex">View on GitHub <ExternalLink className="h-3 w-3"/></a></div><p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400"><Circle className="h-2 w-2 fill-emerald-500 text-emerald-500"/>{repository.default_branch} · {dirtyFiles.length ? `${dirtyFiles.length} unsaved` : 'All changes published'}</p></div><button onClick={() => { setRepository(null); setFiles({}); setTree([]); setActivePath(''); }} className="ml-1 inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"><ChevronDown className="h-3.5 w-3.5"/> Switch</button></div>
          <div className="flex flex-wrap items-center gap-2"><button onClick={() => setPreview((value) => !value)} disabled={!canPreview} title={canPreview ? 'Preview the current HTML file in a sandboxed frame' : 'This starter does not have an HTML preview'} className="button-secondary py-2 text-xs disabled:opacity-40"><Play className="h-3.5 w-3.5"/>{preview ? 'Edit code' : 'Preview'}</button><button onClick={() => void publish()} disabled={busy || !dirtyFiles.length} className="button-secondary py-2 text-xs"><UploadCloud className="h-3.5 w-3.5"/>Publish{dirtyFiles.length > 0 && <span className="rounded-full bg-indigo-50 px-1.5 text-[10px] text-indigo-700">{dirtyFiles.length}</span>}</button><button onClick={() => void verifyMilestone()} disabled={busy || checking || !activeMilestone} className="button-primary py-2 text-xs">{busy || checking ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Sparkles className="h-3.5 w-3.5"/>}{dirtyFiles.length ? 'Publish & check' : 'Check milestone'}</button></div>
        </div>
        {dirtyFiles.length > 0 && <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-2"><span className="text-[11px] font-semibold text-slate-300">Commit message</span><input value={commitMessage} onChange={(event) => setCommitMessage(event.target.value)} className="min-w-44 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none placeholder:text-slate-500 focus:border-indigo-400" aria-label="Commit message"/><span className="hidden items-center gap-1 text-[10px] text-slate-400 sm:flex"><Save className="h-3 w-3"/> Drafts stay in this tab until published</span></div>}
        <div className="grid min-h-[590px] md:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_270px]">
          <aside className={`${mobileFilesOpen ? 'block' : 'hidden'} border-b border-slate-200 bg-slate-950 text-slate-300 md:block md:border-b-0 md:border-r md:border-slate-800`}><div className="flex items-center justify-between border-b border-slate-800 px-4 py-3"><span className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Explorer</span><button onClick={() => setNewPath(newPath ? '' : 'src/new-file.js')} className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="New file"><FilePlus2 className="h-4 w-4"/></button></div>{newPath && <form onSubmit={(event) => { event.preventDefault(); addFile(); }} className="flex gap-1.5 border-b border-slate-800 p-2"><input autoFocus value={newPath} onChange={(event) => setNewPath(event.target.value)} className="min-w-0 flex-1 rounded-md bg-white/10 px-2 py-1.5 text-xs text-white outline-none" placeholder="src/new-file.js"/><button className="rounded-md bg-indigo-500 px-2 text-xs font-bold text-white">Add</button></form>}<div className="max-h-[520px] overflow-y-auto py-2">{groupedEntries.folders.map((folder) => <p key={folder} className="truncate px-4 py-1 text-[11px] text-slate-500">▸ {folder.split('/').pop()}</p>)}{groupedEntries.files.map((entry) => { const dirty = files[entry.path] && files[entry.path].content !== files[entry.path].savedContent; return <button key={entry.path} onClick={() => void openFile(entry)} className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition ${activePath === entry.path ? 'bg-indigo-500/15 text-indigo-200' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><FileCode2 className="h-3.5 w-3.5 shrink-0"/><span className="truncate">{entry.path.split('/').pop()}</span>{dirty && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-300"/>}</button>})}{tree.length === 0 && <p className="px-4 py-5 text-xs text-slate-500">{busy ? 'Loading files…' : 'No files found.'}</p>}</div><div className="border-t border-slate-800 p-3"><button onClick={() => void refreshGitHub()} className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold text-slate-400 hover:bg-white/5 hover:text-white"><RefreshCw className="h-3 w-3"/> Refresh files</button></div></aside>
          <div className="min-w-0 bg-[#1e1e1e]"><div className="flex h-10 items-center justify-between border-b border-white/10 bg-[#181818] px-3 md:hidden"><button onClick={() => setMobileFilesOpen((open) => !open)} className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300"><FolderGit2 className="h-3.5 w-3.5"/>Files <ChevronDown className="h-3 w-3"/></button><span className="max-w-[55%] truncate text-[11px] text-slate-500">{activePath}</span></div>{preview ? <div className="flex h-[590px] flex-col bg-white"><div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"><Play className="h-3 w-3 text-emerald-600"/> Local preview <span className="ml-auto text-[10px] text-slate-400">HTML, CSS, and JavaScript run in a sandboxed iframe</span></div><iframe title="Project preview" sandbox="allow-scripts" srcDoc={previewHtml} className="min-h-0 flex-1 border-0"/></div> : loadingPath ? <div className="flex h-[590px] items-center justify-center gap-2 text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin"/>Opening {loadingPath}</div> : activePath && files[activePath] ? <><div className="flex h-10 items-center gap-2 border-b border-white/10 bg-[#181818] px-4 text-xs text-slate-300"><FileCode2 className="h-3.5 w-3.5 text-indigo-300"/><span className="truncate">{activePath}</span>{files[activePath].content !== files[activePath].savedContent && <span className="ml-1 h-1.5 w-1.5 rounded-full bg-amber-300"/>}</div><Suspense fallback={<div className="flex h-[550px] items-center justify-center text-sm text-slate-400"><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Loading editor…</div>}><MonacoEditor height="550px" theme="vs-dark" language={detectLanguage(activePath)} path={activePath} value={files[activePath].content} onChange={(value) => setFiles((current) => ({ ...current, [activePath]: { ...current[activePath], content: value || '' } }))} options={{ automaticLayout: true, minimap: { enabled: false }, fontSize: 13, lineNumbers: 'on', scrollBeyondLastLine: false, wordWrap: 'on', tabSize: 2, padding: { top: 12 } }}/></Suspense></> : <div className="flex h-[590px] flex-col items-center justify-center px-6 text-center text-slate-400"><FileCode2 className="h-8 w-8 text-slate-600"/><p className="mt-3 text-sm font-semibold text-slate-300">Select a file to start coding</p><p className="mt-1 max-w-sm text-xs leading-5">Your edits stay as drafts in this tab. Publish to GitHub whenever you want your mentor to review them.</p></div>}</div>
          <aside className="border-t border-slate-200 bg-[#fbfcff] p-5 xl:border-l xl:border-t-0"><p className="eyebrow">Learning context</p><h3 className="mt-2 text-sm font-extrabold text-slate-900">{currentPlan.title}</h3><p className="mt-1 text-xs text-slate-500">{currentPlan.tech} · {currentPlan.skillLevel}</p><div className="my-4 h-px bg-slate-200"/><p className="eyebrow">Next milestone</p>{activeMilestone ? <><div className="mt-2 flex items-start gap-2"><span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600"><Clock3 className="h-3 w-3"/></span><div><p className="text-sm font-bold leading-5 text-slate-800">{activeMilestone.title}</p><p className="mt-1 text-[11px] text-slate-400">Milestone {activeMilestone.sequenceNumber} of {milestones.length}</p></div></div>{activeMilestone.learningObjectives && <p className="mt-3 text-xs leading-5 text-slate-500">{activeMilestone.learningObjectives}</p>}<button onClick={() => void verifyMilestone()} disabled={busy || checking} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50">{checking ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : dirtyFiles.length ? <UploadCloud className="h-3.5 w-3.5"/> : <Sparkles className="h-3.5 w-3.5"/>}{dirtyFiles.length ? 'Publish & check' : 'Check milestone'}</button><p className="mt-2 text-[10px] leading-4 text-slate-400">We’ll publish your current draft first, then ask your AI mentor to review the GitHub code.</p></> : <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><Check className="mr-1 inline h-3.5 w-3.5"/>All milestones complete</div>}<div className="my-4 h-px bg-slate-200"/><p className="eyebrow">Publish safely</p><p className="mt-2 text-xs leading-5 text-slate-500">Only the files you changed are included in your next commit. Your repository stays in your GitHub account.</p><a href={repository.html_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900">Open repository <ExternalLink className="h-3.5 w-3.5"/></a></aside>
        </div>
      </section>}

    {createOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setCreateOpen(false); }}><div role="dialog" aria-modal="true" aria-labelledby="create-repo-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="eyebrow">From your learning plan</p><h2 id="create-repo-title" className="mt-1 text-xl font-extrabold text-slate-900">Create your project</h2><p className="mt-1 text-sm text-slate-500">Buildspace will initialize this repo with a starter project.</p></div><button onClick={() => setCreateOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4"/></button></div><label className="mt-5 block text-xs font-bold text-slate-700" htmlFor="repository-name">Repository name</label><input id="repository-name" value={repoName} onChange={(event) => setRepoName(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} className="field mt-2" maxLength={100}/><label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3.5"><input type="checkbox" checked={repoPrivate} onChange={(event) => setRepoPrivate(event.target.checked)} className="mt-0.5 accent-indigo-600"/><span><span className="block text-sm font-bold text-slate-800">Private repository</span><span className="mt-0.5 block text-xs text-slate-500">Only you and collaborators you invite can see this code.</span></span><LockKeyhole className="ml-auto h-4 w-4 text-slate-400"/></label><div className="mt-5 flex justify-end gap-2"><button onClick={() => setCreateOpen(false)} className="button-secondary py-2">Cancel</button><button onClick={() => void createRepository()} disabled={busy || !repoName.trim()} className="button-primary py-2">{busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}Create repo</button></div></div></div>}
  </div>;
};

export default Workspace;
