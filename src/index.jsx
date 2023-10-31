import ForgeUI, { render, Fragment, Macro, Text, useState, ButtonSet, Button } from "@forge/ui";
import { useProductContext } from "@forge/ui";
import api, { route } from "@forge/api";
import { Configuration, OpenAIApi } from 'openai';
import tty from 'tty';

// Function to fetch page data from Confluence
const getPageData = async (pageId) => {
  const response = await api.asApp().requestConfluence(route`/wiki/api/v2/pages/${pageId}?body-format=storage`, {
    headers: {
      'Accept': 'application/json'
    }
  });
  
  // Log the response status and text
  // console.log(`Response: ${response.status} ${response.statusText}`);

  // Extract and return the content of the page
  const responseData = await response.json()
  const returnedData = responseData.body.storage.value
  
  return returnedData
}

// Function to interact with the OpenAI API using a given prompt
const callOpenAI = async (prompt) => {

  // Polyfilling tty.isatty due to a limitation in the Forge runtime
  // This is done to prevent an error caused by a missing dependency
  tty.isatty = () => { return false };

  // Create a configuration object for the OpenAI API
  const configuration = new Configuration({
    apiKey: process.env.OPEN_API_KEY,          // Replace with your actual API key
    organisation: process.env.OPEN_ORG_ID     // Replace with your actual organisation ID
  });

  // Log the API configuration for debugging purposes
  // console.log(configuration)

  // Create an instance of the OpenAIApi with the provided configuration
  const openai = new OpenAIApi(configuration);

  // Log the prompt that will be sent to the OpenAI API
  // console.log(prompt)
  
  // Create a chat completion request using the OpenAI API
  const chatCompletion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",  // Specify the model to use (GPT-3.5 Turbo)
    messages: [{
      role: "user",         // Role of the user in the conversation
      content: prompt       // The user's input prompt
    }]
  });
  
  // Extract the response content from the API response
  const response = chatCompletion.data.choices[0].message.content;
  
  // Log the generated response for debugging purposes
  // console.log("Prompt response - " + response);
  
  // Return the generated response from the OpenAI API
  return response;
}

 const App = () => {
  const context = useProductContext();
  const pageId = context.contentId;

  const [pageData] = useState(async () => {
    return await getPageData(pageId);
  });

  const meetingSummaryPrompt = `Here are the meeting notes:"${pageData}"
    Extract the meeting summary or key takeaways from the notes.
    Return the results as a concise and well-organized summary.`;

  const [meetingSummary, setMeetingSummary] = useState('');

  const fetchMeetingSummary = async () => {
    try {
      const summary = await callOpenAI(meetingSummaryPrompt);
      setMeetingSummary(summary);
    } catch (error) {
      console.error('Error fetching meeting summary:', error);
      // Handle error, show an error message, or retry the request
    }
  };

  const actionItemsPrompt = `Here are the meeting notes:"${pageData}"
    Identify and list any action items or tasks assigned during the meeting.
    Return the results as a numbered list of action items.
    Ensure the output is concise and well-organized.
    If no action items are present in the meeting notes, just return no action items found."`;

  const [actionItems, setActionItems] = useState('');

  const fetchActionItems = async () => {
    try {
      const items = await callOpenAI(actionItemsPrompt);
      setActionItems(items);
    } catch (error) {
      console.error('Error fetching action items:', error);
      // Handle error, show an error message, or retry the request
    }
  };

  const projectUpdatesPrompt = `Here are the meeting notes:"${pageData}"
  Extract any relevant project updates discussed in the meeting.
  Provide the updates in a structured format.
  If no project updates are present in the meeting notes, just return no project updates found."`

  const [projectUpdates, setProjectUpdates] = useState('');

  const fetchProjectUpdates = async () => {
    try {
      const items = await callOpenAI(projectUpdatesPrompt);
      setProjectUpdates(items);
    } catch (error) {
      console.error('Error fetching action items:', error);
      // Handle error, show an error message, or retry the request
    }
  };

  const upcomingDeadlinesPrompt = `Here are the meeting notes:"${pageData}"
  Identify and list any upcoming project deadlines or milestones mentioned in the meeting.
  Return the results in a clear and organized manner.
  If no upcoming deadlines or milestones are present, just return no upcoming deadlines found."`

  const [upcomingDeadlines, setUpcomingDeadlines] = useState('');

  const fetchUpcomingDeadlines = async () => {
    try {
      const items = await callOpenAI(upcomingDeadlinesPrompt);
      setUpcomingDeadlines(items);
    } catch (error) {
      console.error('Error fetching action items:', error);
      // Handle error, show an error message, or retry the request
    }
  };

  const risksAndIssuesPrompt = `Here are the meeting notes:"${pageData}"
  Extract any identified project risks or issues from the meeting.
  Present the risks and issues in a structured format.
  If no risks or issues were mentioned in the meeting notes, just return no risks and issues found."`

  const [risksAndIssues, setRisksAndIssues] = useState('');

  const fetchRisksAndIssues = async () => {
    try {
      const items = await callOpenAI(risksAndIssuesPrompt);
      setRisksAndIssues(items);
    } catch (error) {
      console.error('Error fetching action items:', error);
      // Handle error, show an error message, or retry the request
    }
  };

  const keyDecisionsPrompt = `Here are the meeting notes:"${pageData}"
  Identify and list any key decisions made during the meeting.
  Provide the decisions in a clear and organized manner.
  If no key decisions were made in the meeting, just return no key decisions found."`

  const [keyDescisions, setKeyDecisions] = useState('');

  const fetchKeyDecisions = async () => {
    try {
      const items = await callOpenAI(keyDecisionsPrompt);
      setKeyDecisions(items);
    } catch (error) {
      console.error('Error fetching action items:', error);
      // Handle error, show an error message, or retry the request
    }
  };


  return (
    <Fragment>
      <Button text="Fetch Meeting Summary" onClick={fetchMeetingSummary} />
      <Text>{meetingSummary}</Text>

      <Button text="Fetch Action Items" onClick={fetchActionItems} />
      <Text>{actionItems}</Text>

      <Button text="Fetch Project Updates" onClick={fetchProjectUpdates} />
      <Text>{projectUpdates}</Text>

      <Button text="Fetch Upcoming Deadlines" onClick={fetchUpcomingDeadlines} />
      <Text>{upcomingDeadlines}</Text>

      <Button text="Fetch Risks And Issues" onClick={fetchRisksAndIssues} />
      <Text>{risksAndIssues}</Text>

      <Button text="Fetch Key Decisions" onClick={fetchKeyDecisions} />
      <Text>{keyDescisions}</Text>
    </Fragment>
  );
};

export const run = render(
  <Macro
    app={<App />}
  />
);

