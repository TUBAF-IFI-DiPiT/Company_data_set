# Company data set of the DiP-iT Project

The interactive data explorer is available at [Link](https://tubaf-ifi-dipit.github.io/Company_data_set/).

## Data collection

This repository  illustrates the usage of DiP-iT data set covering 17869 repositories of industrial Github repositories. The collection includes project parameters of 28 companies and was generated in 2021.

## Data collection

| Organization               | Repository count | Commit count >1    | Relevant repositories |
| -------------------------- | ---------------- | ------------------ | --------------------- |
| Microsoft                  | 4225             | 4184               | 1908                  |
| IBM                        | 2178             | 2051               | 1178                  |
| Google                     | 2037             | 1925               | 849                   |
| Microsoft Azure            | 1540             | 1496               | 614                   |
| Google Cloud Platform      | 898              | 864                | 351                   |
| Mapbox                     | 850              | 836                | 447                   |
| Adobe, Inc.                | 666              | 656                | 239                   |
| Amazon Web Services - Labs | 633              | 632                | 295                   |
| JetBrains                  | 551              | 544                | 125                   |
| Unity Technologies         | 535              | 520                | 211                   |
| Facebook Research          | 489              | 421                | 280                   |
| Facebook Archive           | 409              | 394                | 201                   |
| GitHub                     | 388              | 382                | 116                   |
| Alibaba                    | 368              | 357                | 150                   |
| Amazon Web Services        | 292              | 290                | 51                    |
| Oracle                     | 269              | 264                | 89                    |
| NVIDIA Corporation         | 268              | 257                | 78                    |
| Spotify                    | 253              | 247                | 106                   |
| Dropbox                    | 206              | 198                | 72                    |
| Netflix, Inc.              | 200              | 198                | 50                    |
| .NET Platform              | 200              | 198                | 36                    |
| Airbnb                     | 188              | 185                | 42                    |
| Yahoo                      | 172              | 167                | 68                    |
| Uber Open-Source           | 138              | 137                | 33                    |
| NVIDIA Research Projects   | 137              | 128                | 97                    |
| Apple                      | 132              | 114                | 32                    |
| Twitter                    | 114              | 114                | 28                    |
| ASP.NET                    | 111              | 110                | 13                    |
| $\sum$ ($n_o$=28)          | $n$=18447        | $n_{all}$  = 17869 | $n_{rel}$=7759        |

### Features 

| name : type                           | meaning                                                                                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| effective\_duration\_weeks: int       | Project duration calculated based on initial and final commit. Weeks without activities were excluded.                                                                                                  |
| weekly\_contributors\_max: int        | Maximum number of developers contributing to the project per week.                                                                                                                                      |
| language: string                      | The GitHub API provides a list of used programming languages in the project. This parameter considers the highest ranked.                                                                               |
| branches\_exist: bool                 | Branches can hold different file versions and can be used to implement multiple features at the same time. The default repository branch (master/main) and deleted branches are not taken into account. |
| commit\_comments\_exist: bool         | A user can directly comment on a commit.                                                                                                                                                                |
| pages\_exist: bool                    | The users provide web-pages implemented with the GitHub pages concept.                                                                                                                                  |
| release\_exist: bool                  | The project provides a list of at least one official release.                                                                                                                                           |
| issues\_comment\_exist: bool          | An issue was commented by another user.                                                                                                                                                                 |
| issues\_exist: bool                   | Issues can be used to structure the workflow by describing and discussing a problem. Its state is not considered.                                                                                       |
| label\_exist: bool                    | Do labels exist, which have been used to mark issues (e.g., bug, improvement, good first issue, etc.)                                                                                                   |
| milestone\_exist: bool                | The team defined deadlines which can be connected to an issue or pull request.                                                                                                                          |
| pr\_exist: bool                       | Pull requests show the differences between two branches in order to discuss the new implemented features. Its state is not considered.                                                                  |
| pr\_review\_exist: bool               | A pull request can be reviewed from a user to ensure the quality of the new code.                                                                                                                       |
| tag\_exist: bool                      | A tag flags a commit with a short text in order to mark specific states of the code.                                                                                                                    |
| workflow\_exist: bool                 | A continuous integration workflow (Action) describes an action after each commit on predefined branches. A test workflow is commonly used to perform automated tests.                                   |
| file\_contributing\_exist: bool       | The repository contains a description of the contribution process explaining the collaboration process.                                                                                                 |
| file\_code\_of\_conduct\_exist bool   | The maintainer defines a code of conduct for the repository.                                                                                                                                            |
| file\_IssuePR\_templates\_exist: bool | The project provides templates for discussions and feedbacks.                                                                                                                                           |
| file\_security\_exist: bool           | A specific file explains how newly raised safety issues have to be announced to other contributors.                                                                                                     |




## Implementation 

### Installation

The package contains a virtual python environment based on `pipenv`. Follow the instructions for installation of the tool [Link](https://pipenv.pypa.io/en/latest/installation/). Afterwards run `pipenv install` in the project folder. 

### Inspecting the notebook

The implementation of the dashboard uses panel and hvplot. The notebook contains the chain of data handling, filtering and visualisation as well as the actual configuration of the dashboard. Feel free to replace the comment in the last code chunk and receive the result in your browser directly.

```python
#template.show()         # Testing purposes 
template.servable()      # Generation
```

### Executing the dash board generation

Start the generation process by executing `panel convert`. Please consider the documentation of this [tool](https://panel.holoviz.org/how_to/wasm/convert.html).

```
pipenv run panel convert notebook/html_generator.ipynb --to pyodide-worker --out . --requirements pandas hvplot
```
