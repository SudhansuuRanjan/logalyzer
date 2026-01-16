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