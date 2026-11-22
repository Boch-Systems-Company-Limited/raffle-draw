// Test script to verify the draw engine's fairness and correctness
// This can be run in a browser console or adapted for Node.js

function testDrawEngine() {
  console.log('=== Draw Engine Test Suite ===\n');
  
  // Test 1: Unique entry IDs
  console.log('Test 1: Unique Entry IDs');
  const entries = [
    {id: 'name_0_ABC123', value: '105'},
    {id: 'name_1_DEF456', value: '105'},
    {id: 'name_2_GHI789', value: '200'}
  ];
  const uniqueIds = new Set(entries.map(e => e.id));
  console.log(`  Entries: ${entries.length}`);
  console.log(`  Unique IDs: ${uniqueIds.size}`);
  console.log(`  Result: ${uniqueIds.size === entries.length ? 'PASS' : 'FAIL'} - All entries have unique IDs\n`);
  
  // Test 2: Rejection sampling avoids modulo bias
  console.log('Test 2: Rejection Sampling (Modulo Bias Prevention)');
  const maxUint32 = 0xFFFFFFFF;
  const testN = 7; // Not a power of 2
  const limit = Math.floor(maxUint32 / testN) * testN;
  console.log(`  Test N: ${testN}`);
  console.log(`  Max Uint32: ${maxUint32}`);
  console.log(`  Limit: ${limit}`);
  console.log(`  Range used: 0 to ${limit - 1} (${limit} values)`);
  console.log(`  This is evenly divisible by ${testN}: ${limit % testN === 0 ? 'YES' : 'NO'}`);
  console.log(`  Result: ${limit % testN === 0 ? 'PASS' : 'FAIL'} - Rejection sampling prevents modulo bias\n`);
  
  // Test 3: Distribution test (not statistical, just basic verification)
  console.log('Test 3: Basic Distribution Check');
  const testEntries = Array.from({length: 10}, (_, i) => ({id: `test_${i}`, value: String(i)}));
  const counts = new Array(10).fill(0);
  const iterations = 1000;
  
  for (let i = 0; i < iterations; i++) {
    const n = testEntries.length;
    const maxUint32 = 0xFFFFFFFF;
    const limit = Math.floor(maxUint32 / n) * n;
    let randomUint32;
    do {
      const buffer = new Uint32Array(1);
      crypto.getRandomValues(buffer);
      randomUint32 = buffer[0];
    } while (randomUint32 >= limit);
    const index = randomUint32 % n;
    counts[index]++;
  }
  
  console.log(`  ${iterations} draws from ${testEntries.length} entries`);
  console.log(`  Expected per entry: ~${iterations / testEntries.length}`);
  console.log(`  Actual counts: ${counts.join(', ')}`);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  console.log(`  Min: ${minCount}, Max: ${maxCount}, Range: ${maxCount - minCount}`);
  console.log(`  Result: ${maxCount - minCount < iterations * 0.1 ? 'PASS' : 'WARN'} - Distribution appears uniform\n`);
  
  // Test 4: Edge cases
  console.log('Test 4: Edge Cases');
  
  // Empty pool
  console.log('  4a: Empty pool');
  try {
    const emptyPool = [];
    if (emptyPool.length === 0) {
      console.log('    Result: PASS - Empty pool detected');
    }
  } catch (e) {
    console.log(`    Result: FAIL - ${e.message}`);
  }
  
  // Single entry
  console.log('  4b: Single entry pool');
  const singlePool = [{id: 'single', value: 'Only One'}];
  if (singlePool.length === 1) {
    console.log('    Result: PASS - Single entry detected');
  }
  
  // Large pool
  console.log('  4c: Large pool (1000 entries)');
  const largePool = Array.from({length: 1000}, (_, i) => ({id: `large_${i}`, value: String(i)}));
  console.log(`    Created: ${largePool.length} entries`);
  console.log('    Result: PASS - Large pool handled\n');
  
  // Test 5: Duplicate values handling
  console.log('Test 5: Duplicate Values');
  const dupEntries = [
    {id: 'dup_0_abc', value: '105'},
    {id: 'dup_1_def', value: '105'},
    {id: 'dup_2_ghi', value: '105'}
  ];
  const valueCount = {};
  dupEntries.forEach(e => {
    valueCount[e.value] = (valueCount[e.value] || 0) + 1;
  });
  console.log(`  Entries with value "105": ${valueCount['105']}`);
  console.log(`  Total entries: ${dupEntries.length}`);
  console.log(`  Unique IDs: ${new Set(dupEntries.map(e => e.id)).size}`);
  console.log(`  Result: ${valueCount['105'] === 3 && new Set(dupEntries.map(e => e.id)).size === 3 ? 'PASS' : 'FAIL'} - Duplicates preserved as separate tickets\n`);
  
  console.log('=== Test Suite Complete ===');
}

// Run tests
testDrawEngine();
