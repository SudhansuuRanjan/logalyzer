import axios from "axios";
const map = new Map();
map.set("prod", "gbujira");
map.set("stag", "gbujira-stage");

export const fetchJiraIssue = async (issueKey: string, pat: string, env: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/api/2/issue/${issueKey}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );


    let executionData = [];
    if (response) {
      const executions = await axios.get(
        `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/execution?issueId=${response.data.id}`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            "Content-Type": "application/json",
          },
        }
      );
      executionData = executions.data.executions;
    }

    return { data: response.data, executions: executionData };
  } catch (err: any) {
    throw new Error(`Jira API Error: ${err.message} (Status: ${err.response?.status || 'unknown'})`);
  }
};

export const fetchTestSteps = async (issueId: string, pat: string, env: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/teststep/${issueId}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(`ZAPI Error: ${err.message} (Status: ${err.response?.status || 'unknown'})`);
  }
};



export const fetchTCExecution = async (executionId: string, pat: string, env: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/stepResult?executionId=${executionId}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(`ZAPI Error: ${err.message} (Status: ${err.response?.status || 'unknown'})`);
  }
};

type AtLeastOne<T, Keys extends keyof T = keyof T> =
  Keys extends keyof T
  ? Required<Pick<T, Keys>> & Partial<Omit<T, Keys>>
  : never;

type StepResultPayload = {
  status: string;
  comment: string;
};

export const postSingleStepResult = async (
  stepId: string,
  pat: string,
  env: string,
  data: AtLeastOne<StepResultPayload>
): Promise<any> => {
  try {
    const response = await axios.put(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/stepResult/${stepId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
};


type StepUpdatePayload = {
  data: string,
  step: string,
  result: string
};

export const updateTestStep = async (
  issueId: string,
  stepId: string,
  pat: string,
  env: string,
  data: AtLeastOne<StepUpdatePayload>
): Promise<any> => {
  try {
    const response = await axios.put(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/teststep/${issueId}/${stepId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
};

export const deleteTestStep = async (
  issueId: string,
  stepId: string,
  pat: string,
  env: string,
): Promise<any> => {
  try {
    const response = await axios.delete(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/teststep/${issueId}/${stepId}`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
};


type StepCreatePayload = {
  data: string,
  step: string,
  result: string
};

export const createTestStep = async (
  issueId: string,
  pat: string,
  env: string,
  data: AtLeastOne<StepCreatePayload>
): Promise<any> => {
  try {
    const response = await axios.post(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/teststep/${issueId}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
};



export const fetchExecutionAutoComplete = async (pat: string, env: string, params: any): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/zql/autocomplete`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        params: params
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
}

export const fetchExecutionSearch = async (pat: string, env: string, zqlQuery: string, offset: number, maxRecords: number): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/zql/executeSearch/`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
        params: {
          zqlQuery,
          offset,
          maxRecords,
          expand: "executionStatus"
        }
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
}


// Query Example:  "fixVersion = Eagle_47.0.0.4 AND project = \"CGIU DSRQA\" AND cycleName = \"47.0.0.4 MR\"",
export const exportExecutionOverview = async (pat: string, env: string, query: string): Promise<any> => {
  try {
    const response = await axios.post(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/execution/export`,
      {
        "exportType": "csv",
        "maxAllowedResult": "false",
        "expand": "teststeps",
        "startIndex": "0",
        "zqlQuery": query,
        "executions": [],
        "isUI": true,
        "offset": 0
      },
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
}



// https://gbujira.oraclecorp.com/rest/zapi/latest/execution/jobProgress/0001768751449925-2001705ffffcaf7-0001?type=bulk_execution_export_job_progress
export const exportExecutionProgress = async (pat: string, env: string, export_id: string): Promise<any> => {
  try {
    const response = await axios.get(
      `https://${map.get(env)}.oraclecorp.com/rest/zapi/latest/execution/jobProgress/${export_id}?type=bulk_execution_export_job_progress`,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
}

// https://gbujira.oraclecorp.com/plugins/servlet/export/exportAttachment?fileName=ZFJ-Executions-01-18-2026.csv


export const fetchExportedCsv = async (url: string, pat: string): Promise<any> => {
  try {
    const response = await axios.get(
      url,
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (err: any) {
    throw new Error(
      `ZAPI Error: ${err.message} (Status: ${err.response?.status || "unknown"})`
    );
  }
}


// Fetch Epics : POST https://gbujira.oraclecorp.com/rest/issueNav/1/issueTable
// Body : startIndex=0&jql=project+%3D+DSRQA+AND+issuetype+%3D+Epic+ORDER+BY+priority+ASC%2C+updated+DESC&layoutKey=split-view

export const fetchEpics = async (pat: string, env: string): Promise<any> => {
  try {
    const response = await axios.post(`https://${map.get(env)}.oraclecorp.com/rest/api/2/search`,
      {
        "jql": "project = DSRQA AND issuetype = Epic ORDER BY priority ASC, updated DESC",
        "fields": [
          "summary",
          "status",
          "priority",
          "updated",
          "customfield_10011"
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json",
        },
      });
    return response.data;
  } catch (err: any) {
    throw new Error(
      `Jira API Error: ${err.message} (Status: ${err.response?.status || 'unknown'})`
    );
  }
}

export const fetchIssuesInEpic = async (
  epicKey: string,
  pat: string,
  env: string,
  startAt: number = 0,
  maxResults: number = 50
) => {
  const response = await axios.get(
    `https://${map.get(env)}.oraclecorp.com/rest/agile/1.0/epic/${epicKey}/issue?startAt=${startAt}&maxResults=${maxResults}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};


// https://gbujira.oraclecorp.com/rest/api/2/issue/20170298

export const fetchIssueDetails = async (
  issueKey: string,
  pat: string,
  env: string
) => {
  const response = await axios.get(
    `https://${map.get(env)}.oraclecorp.com/rest/api/2/issue/${issueKey}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json"
      }
    }
  );
  return response.data;
};


export const createIssue = async (
  payload: any,
  pat: string,
  env: string
) => {
  try {
    const fields: any = {
      project: { id: payload.projectId },
      issuetype: { id: payload.issueTypeId },
      summary: payload.summary
    };

    // Plain string description (Server/DC)
    if (payload.description) {
      fields.description = payload.description;
    }

    // Epic Name is mandatory
    if (payload.issueTypeId === "6") {
      fields.customfield_10903 =
        payload.customFields?.customfield_10903 || payload.summary;
    }

    // Any extra custom fields
    if (payload.customFields) {
      Object.assign(fields, payload.customFields);
    }

    const response = await axios.post(
      `https://${map.get(env)}.oraclecorp.com/rest/api/2/issue`,
      { fields },
      {
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (err: any) {
    if (err.response) {
      console.error(
        "JIRA ERROR:",
        JSON.stringify(err.response.data, null, 2)
      );
    }
    throw err;
  }
};


export const linkIssue = async (
  storyKey: string,
  testKey: string,
  pat: string,
  env: string
) => {
  const response = await axios.post(
    `https://${map.get(env)}.oraclecorp.com/rest/api/3/issueLink`,
    {
      type: { name: "Covers" },
      inwardIssue: { key: storyKey },
      outwardIssue: { key: testKey }
    },
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json",
        "X-Atlassian-Token": "no-check"   // <-- THIS IS THE MAGIC
      }
    }
  );

  console.log(response.data)
  return response.data;
};

