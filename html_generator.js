importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['markdown-it-py<3', 'https://cdn.holoviz.org/panel/1.1.1/dist/wheels/bokeh-3.1.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.1.1/dist/wheels/panel-1.1.1-py3-none-any.whl', 'pyodide-http==0.2.1', 'pandas']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

#!/usr/bin/env python
# coding: utf-8

# In[1]:


#from pathlib import Path
import pandas as pd

import panel as pn
pn.extension('tabulator')
import hvplot.pandas


# In[2]:


## Local data storage
file_name = "repository_data_final.csv"
folder_name = "data_1.0/"
#data_file = Path.cwd() / ".." / folder_name / file_name
#df = pd.read_csv(data_file)


# In[3]:


# web based data storage
#df = pd.read_csv("https://sebastianzug.github.io/TUBAF-IFI-DiPiT/Company_data_set/repository_data_final.csv?raw=true")
#df = pd.read_csv("https://github.com/TUBAF-IFI-DiPiT/Company_data_set/blob/main/repository_data_final.csv?raw=true")
df = pd.read_csv("https://raw.githubusercontent.com/TUBAF-IFI-DiPiT/Company_data_set/main/repository_data_final.csv")

#df = pd.read_csv("https://raw.githubusercontent.com/TUBAF-IFI-DiPiT/Company_data_set/gh_pages/repository_data_final.csv")


# In[4]:


df_summary = df.copy()

max_contributers = 10
df_summary.loc[(df_summary.weekly_cc_max > max_contributers),'weekly_cc_max'] = max_contributers + 1

max_duration = 10
df_summary.loc[(df_summary.effective_weeks > max_duration),'effective_weeks'] = max_duration + 1
df_summary['relevant'] = False

df_summary.loc[(df_summary.weekly_cc_max <= max_contributers) & 
       (df_summary.effective_weeks <= max_duration) &
       (df_summary.commit_greater1_exist == True), "relevant"] = True

df_summary = df_summary[df_summary.relevant]


# ## Preparation

# In[5]:


if 'data' not in pn.state.cache.keys():
    pn.state.cache['data'] = df_summary.copy()
else: 
    df_summary = pn.state.cache['data']
    
# Make DataFrame Pipeline Interactive
idf = df_summary.interactive()


# ## Part 1: Diagramm

# In[6]:


param = df_summary.organization_name.unique().tolist()

select_org = pn.widgets.Select(
    name='organization_name',
    value="Microsoft",
    options=param
)


# In[7]:


data_pipeline_selectcomp_basic = (
        idf[idf.organization_name == select_org]\
           .pivot_table(values='repo_name', index='weekly_cc_max', 
                        columns='effective_weeks', 
                        aggfunc='count')\
           .unstack()\
           .reset_index()\
           .rename(columns={0: "count"})
)

data_pipeline_selectcomp_basic.head()


# In[8]:


heatmap = data_pipeline_selectcomp_basic.hvplot.heatmap(x='weekly_cc_max', y='effective_weeks', C='count', 
                                            xlim=(0, max_contributers+1), ylim =(0, max_duration+1),
                                            title='Number of relevant repositories (effective contributors < 10 and effective duration < 10 weeks) in data set', 
                                            )

heatmap


# ## Part 2: Parameter diagram

# In[9]:


param = ['stars',
       'size_kB', 'contributor_count', 'branch_count', 'commit_count',
       'commit_comment_count', 'last_commit_date', 'labels_count', 'tag_count',
       'milestone_count', 'pullrequest_count', 'pullrequest_review_count',
       'release_count', 'workflow_count', 'readme_length', 'issues_count',
       'issues_comment_count', 'watchers_count', 'project_duration_days', 
       'project_duration_weeks', 
       'creation_date_year', 'subscribers_count', 'forks_count',
       'effective_weeks', 'weekly_cc_max', 'weekly_cc_mean', 'weekly_cc_std',
       'weekly_cc_mean_normalized']


# In[10]:


data_pipeline_selectcomp = (
     idf[idf.organization_name == select_org]\
        .groupby("organization_name")\
        .agg(
              relevant_repositories=('contributor_count', 'count'), 
              branches_exist_in =('branch_exist', 'sum'),
              issues_exist_in =('issues_exist', 'sum'),
              pr_exist_in =('pr_exist', 'sum'),
              issues_commment_exist_in =('issues_commment_exist', 'sum'),
              pr_review_exist_in =('pr_review_exist', 'sum'),
        )\
        .transpose()
)


# In[11]:


company_table = data_pipeline_selectcomp.pipe(pn.widgets.Tabulator) 

company_table


# In[12]:


data_pipeline_selectcomp_all = (
     idf[idf.organization_name == select_org]
)


# In[13]:


company_table_all = data_pipeline_selectcomp_all.pipe(pn.widgets.Tabulator) 


# ## Generate Dashboard

# In[14]:


template = pn.template.FastListTemplate(
    title = "DiP-iT Dataset",
    sidebar =[pn.pane.Markdown("#Abstract"),
              pn.pane.Markdown("This page illustrates the usage of DiP-iT data set covering 17000 repositories of industrial Github repositories. The collection includes project parameters of 17 companies and was generated in 2021."),
              pn.pane.Markdown("An overview about the contained parameters is provided [here](). We used the [github2pandas Package]() for generating the data set."),
              pn.pane.Markdown("#Company selection"),
              pn.pane.Markdown("The dashboard filters the repositories and depicts the distributions of contributors and duration for smaller projects."),
              select_org,
              pn.pane.Markdown("#Data set"),
              pn.pane.Markdown("The whole data set can be downloaded [here]()"),
             ],
    main=[pn.Row
            (
            pn.Column(
               heatmap.panel(width=600, height=500, margin=(0, 100, 0, 20))
               ),
            pn.Column(
               company_table.panel(width=1000)
               )
            ),
            pn.Row
            (
               company_table_all.panel(width=1000, height=500)
            )  
        ]
)

#template.show()
template.servable()


# In[ ]:






await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `)
  }
}

startApplication()