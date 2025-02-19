export const generateChatPrompt = (
  projects: { title: string; description: string }[],
  profession: string,
  mode: 'rewrite' | 'improve' | 'similar' | 'weaknesses' | 'expansion' | 'monetize' | 'audience' | 'ideas',
): string => {
  const project = projects[0]?.title;

  if (mode === 'rewrite') {
    return `The user is a **${profession}**. They have an unclear project titled **${project}**. 
Generate a professional and clear **title** and **description** based on the available tags and project type.
  
**Return JSON:**
{
  "project": "${project}",
  "newTitle": "More Descriptive Project Name",
  "newDescription": "A short but clear description that conveys the purpose of the project."
}`;
  }

  if (mode === 'improve') {
    return `The user is a **${profession}**. They have a project titled **${project}**.
Suggest 3 key improvements related to UI, features, or functionality.

**Return JSON:**
{
  "project": "${project}",
  "improvements": [
    { "title": "Improvement 1", "description": "Brief explanation." },
    { "title": "Improvement 2", "description": "Brief explanation." },
    { "title": "Improvement 3", "description": "Brief explanation." }
  ]
}`;
  }

  if (mode === 'similar') {
    return `The user is a **${profession}**. They have a project titled **${project}**.
Suggest 3 closely related project ideas that align with the project's industry, function, or purpose.

- The suggestions should be real-world project ideas, NOT random AI-generated names.
- Each suggested project must be clearly related to the project title.
- Include a short description explaining why it is similar.

**Return JSON:**
{
  "project": "${project}",
  "similarProjects": [
    { "title": "Similar Project 1", "description": "Brief explanation of similarity." },
    { "title": "Similar Project 2", "description": "Brief explanation of similarity." },
    { "title": "Similar Project 3", "description": "Brief explanation of similarity." }
  ]
}`;
  }

  if (mode === 'audience') {
    return `The user is a **${profession}**. They have a project titled **${project}**.
Analyze the provided project description and identify the most relevant target audiences.

- Do NOT generate generic audiences (e.g., "students", "parents").
- Use the project title and description to infer the best-fit users.
- If the description is too vague, make reasonable assumptions based on the project title.
- Each audience must have a descriptive title and a detailed explanation of their needs.

**Return JSON:**
{
  "project": "${project}",
  "audienceAnalysis": [
    { "title": "Specific Audience 1", "description": "Detailed explanation based on project purpose." },
    { "title": "Specific Audience 2", "description": "Detailed explanation based on project purpose." },
    { "title": "Specific Audience 3", "description": "Detailed explanation based on project purpose." }
  ]
}`;
  }

  if (mode === 'monetize') {
    return `The user is a **${profession}**. They have a project titled **${project}**.
Suggest 3 realistic monetization strategies that can generate revenue.

- Each strategy should be a viable business model (e.g., subscriptions, affiliate marketing).
- Describe exactly how revenue is generated (e.g., "Earn commission on every sale").
- Avoid any additional commentary or explanations outside of the JSON.

**Return ONLY JSON in the following format:**
{
  "project": "${project}",
  "monetizationStrategies": [
    { "title": "Strategy 1", "description": "Brief explanation of how revenue is generated." },
    { "title": "Strategy 2", "description": "Brief explanation of how revenue is generated." },
    { "title": "Strategy 3", "description": "Brief explanation of how revenue is generated." }
  ]
}`;
  }

  // Fallback: Audience Analysis
  return `The user is a **${profession}**. They have a project titled **${project}**.
Identify the target audience and key user needs.

**Return JSON:**
{
  "project": "${project}",
  "audienceAnalysis": [
    { "title": "Target Audience 1", "description": "Short explanation." },
    { "title": "Target Audience 2", "description": "Short explanation." },
    { "title": "Target Audience 3", "description": "Short explanation." }
  ]
}`;
};
