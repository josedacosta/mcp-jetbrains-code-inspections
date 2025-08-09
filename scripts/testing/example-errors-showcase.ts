/**
 * Test file with various TypeScript/JavaScript errors for IDE inspection testing
 * This file intentionally contains errors to test JetBrains code inspections
 */

// ============================================================================
// CRITICAL ERRORS - Will prevent compilation
// ============================================================================

// Syntax Error: Missing closing bracket
function brokenFunction() {
    console.log('Missing closing bracket');
    // Fixed: Added closing parenthesis and semicolon
}

// Type Error: Cannot find name
console.log(undefinedVariable);
const result = nonExistentFunction();

// Type Error: Type mismatch
const numberValue: number = 'This is a string';
const booleanValue: boolean = 123;

interface User {
    name: string;
    age: number;
}
const user: User = {
    name: 'John',
    // Missing required property 'age'
};

// ============================================================================
// HIGH SEVERITY - Major issues that should be fixed
// ============================================================================

// Unreachable code
function unreachableExample() {
    return true;
    console.log('This will never execute');
    const neverUsed = 'unreachable';
}

// Infinite loop
function infiniteLoop() {
    while (true) {
        // No break condition
    }
    console.log('Never reached');
}

// Division by zero
const divisionByZero = 10 / 0;

// Duplicate function declaration
function duplicateFunction() {
    return 1;
}
function duplicateFunction() {
    return 2;
}

// ============================================================================
// MEDIUM SEVERITY - Code quality issues
// ============================================================================

// Unused variables
const unusedVariable = "I'm never used";
let anotherUnused = 42;
function unusedFunction() {
    return 'Never called';
}

// Empty catch block
try {
    throw new Error('Test error');
} catch (e) {
    // Empty catch - error swallowed
}

// Comparing with NaN
const nanComparison = NaN === NaN;
if (someValue == NaN) {
    console.log('Wrong NaN comparison');
}

// Dead code / Unnecessary condition
const alwaysTrue = true;
if (alwaysTrue) {
    console.log('Always executes');
} else {
    console.log('Dead code');
}

// Duplicate conditions
const x = 5;
if (x > 3) {
    console.log('First');
} else if (x > 3) {
    console.log('Duplicate condition');
}

// ============================================================================
// LOW SEVERITY - Style and convention issues
// ============================================================================

// Missing semicolons (if strict mode)
const noSemicolon = 'missing semicolon';
let anotherMissing = true;

// Inconsistent naming conventions
const snake_case_variable = 'wrong convention';
const PascalCaseVariable = 'should be camelCase';
function CapitalizedFunction() {
    return 'Should start with lowercase';
}

// Magic numbers
function calculatePrice(quantity: number) {
    return quantity * 19.99; // Magic number
}
const tax = 0.21; // Magic number

// Long function
function veryLongFunction() {
    console.log('Line 1');
    console.log('Line 2');
    console.log('Line 3');
    console.log('Line 4');
    console.log('Line 5');
    console.log('Line 6');
    console.log('Line 7');
    console.log('Line 8');
    console.log('Line 9');
    console.log('Line 10');
    console.log('Line 11');
    console.log('Line 12');
    console.log('Line 13');
    console.log('Line 14');
    console.log('Line 15');
    console.log('Line 16');
    console.log('Line 17');
    console.log('Line 18');
    console.log('Line 19');
    console.log('Line 20');
    // Functions shouldn't be this long
}

// ============================================================================
// WARNINGS - Potential issues
// ============================================================================

// == instead of ===
if ('5' == 5) {
    console.log('Loose equality');
}

// Implicit any
function implicitAny(param) {
    return param;
}

// Reassigning const (will error)
const constantValue = 10;
// constantValue = 20; // Uncomment to see error

// Array index out of bounds (potential)
const smallArray = [1, 2, 3];
console.log(smallArray[10]); // undefined

// Null/undefined access
let possiblyNull: string | null = null;
console.log(possiblyNull.length); // Will error at runtime

// ============================================================================
// ASYNC/PROMISE ISSUES
// ============================================================================

// Missing await
async function missingAwait() {
    const promise = fetch('/api/data');
    console.log(promise); // Should await
}

// Async function without error handling
async function noErrorHandling() {
    const data = await fetch('/api/data');
    return data.json(); // No try/catch
}

// Promise not handled
fetch('/api/data'); // Promise ignored

// ============================================================================
// SECURITY ISSUES
// ============================================================================

// eval usage (dangerous)
const userInput = "alert('XSS')";
eval(userInput);

// SQL injection vulnerable pattern (example)
function unsafeQuery(userId: string) {
    const query = `SELECT * FROM users WHERE id = ${userId}`;
    // Direct string interpolation in SQL
    return query;
}

// Hardcoded credentials
const API_KEY = 'sk-1234567890abcdef';
const password = 'admin123';

// ============================================================================
// PERFORMANCE ISSUES
// ============================================================================

// Inefficient array operation in loop
const largeArray = Array(1000).fill(0);
for (let i = 0; i < largeArray.length; i++) {
    // Array.includes in loop is O(n²)
    if (largeArray.includes(i)) {
        console.log(i);
    }
}

// Memory leak pattern
let leakyArray: any[] = [];
setInterval(() => {
    leakyArray.push(new Array(1000000));
    // Never cleared
}, 100);

// ============================================================================
// REACT/JSX SPECIFIC (if React plugin enabled)
// ============================================================================

// Missing key in list
const items = [1, 2, 3];
const listItems = items.map(
    (item) => `<li>${item}</li>`, // Missing key prop
);

// Direct DOM manipulation (anti-pattern in React)
if (typeof document !== 'undefined') {
    document.getElementById('root').innerHTML = 'Bad practice';
}

// ============================================================================
// TYPESCRIPT SPECIFIC
// ============================================================================

// @ts-ignore without justification
// @ts-ignore
const ignoredError = wrongType;

// Type assertion abuse
const someValue: any = 'this is a string';
const strLength: number = (someValue as string).length;
const wrongAssertion = (someValue as number).toFixed(2);

// Interface vs Type inconsistency
interface IUser {
    name: string;
}
type TUser = {
    name: string;
};

// Missing return type annotation
function noReturnType(a: number, b: number) {
    return a + b;
}

// ============================================================================
// IMPORT/EXPORT ISSUES
// ============================================================================

// Circular dependency pattern
// Unused imports

// Wrong import path

// ============================================================================
// REGEX ISSUES
// ============================================================================

// Catastrophic backtracking
const dangerousRegex = /^(a+)+$/;
const testString = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaab';
// dangerousRegex.test(testString); // Will hang

// Invalid regex
try {
    new RegExp('['); // Invalid regex
} catch (e) {
    // Ignored
}

// ============================================================================
// CLASS ISSUES
// ============================================================================

class ProblematicClass {
    private unusedPrivate: string = 'unused';

    constructor(public value: number) {
        // Direct property access before super() in derived class
    }

    // Getter without setter
    get onlyGetter() {
        return this.value;
    }

    // Method that doesn't use 'this'
    staticMethod() {
        return 42;
    }
}

// ============================================================================
// SWITCH CASE ISSUES
// ============================================================================

const testCase = 2;
switch (testCase) {
    case 1:
        console.log('One');
    // Missing break - falls through
    case 2:
        console.log('Two');
        break;
    case 2: // Duplicate case
        console.log('Duplicate');
        break;
    // Missing default case
}

// ============================================================================
// NULL/UNDEFINED ISSUES
// ============================================================================

// Triple equals with null
if (someVar === null || someVar === undefined) {
    // Should use someVar == null
}

// Optional chaining abuse
const deepAccess = obj?.prop1?.prop2?.prop3?.prop4?.prop5;

// Nullish coalescing with boolean
const booleanDefault = false ?? true; // Wrong usage

// ============================================================================
// CONSOLE STATEMENTS (should be removed in production)
// ============================================================================

console.log('Debug statement');
console.error('Error logging');
console.warn('Warning');
console.debug('Debug info');
debugger; // Debugger statement

// ============================================================================
// TESTING EXPORTS
// ============================================================================

export {
    brokenFunction,
    unreachableExample,
    ProblematicClass,
    divisionByZero,
    // Exporting undefined variables
    nonExistentExport,
};

// Default export at the end (style issue)
export default function () {
    return 'Anonymous default export';
}
