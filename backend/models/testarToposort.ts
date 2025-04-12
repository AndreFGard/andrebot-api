import { ToposortModel } from './toposortmodel';
import * as path from 'path';

// Specify the path to the test JSON file
const filePath = path.join(__dirname, '../perfil_curricular-computacao-2023.json');

// Initialize the ToposortModel with the test file
const model = new ToposortModel(filePath);

// Test the model's behavior by calling the atualizarPrerequisitos() function
const availableCourses = model.atualizarPrerequisitos();

// Log the result
console.log('Available courses:', availableCourses);