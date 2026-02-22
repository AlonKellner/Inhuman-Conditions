/**
 * End-to-End Game Flow Test
 * Complete game playthrough using ONLY GameEngine (no React, no UI)
 * Proves Constitution Principle VII: Game logic is fully testable independently
 */

import { describe, it, expect } from 'vitest';
import { GameEngine } from '../../src/engine/GameEngine';
import type { GameEngineEvent } from '../../src/engine/types';
import { RoleType } from '../../src/types';

describe('E2E: Complete Game Flow (Pure Engine)', () => {
  it('should play through complete game from seed to conclusion', () => {
    // === SETUP ===
    const engine = new GameEngine();
    const events: GameEngineEvent[] = [];

    // Track all game events
    engine.subscribe((event) => {
      events.push(event);
      console.log(`[Game Event] ${event.type}`);
    });

    console.log('\n🎮 Starting Inhuman Conditions Game (Pure Engine Test)\n');

    // === STEP 1: Initialize Game with Seed ===
    console.log('📝 Step 1: Initialize game with seed...');
    engine.initialize({
      seed: 'DEMO',
      mode: 'single-device',
      playerRole: 'investigator',
    });

    let state = engine.getState();
    console.log(`   ✅ Game initialized`);
    console.log(`   📦 Packet: ${state.selectedPacket?.name}`);
    console.log(`   ⚠️  Penalty: ${state.selectedPenalty?.text}`);
    console.log(`   👤 Role: ${state.selectedRole?.roleType}`);
    console.log(`   🎭 Background: ${state.selectedBackground?.name}`);

    // Verify initialization
    expect(state.config.seed).toBe('DEMO');
    expect(state.selectedPacket).not.toBeNull();
    expect(state.selectedPenalty).not.toBeNull();
    expect(state.selectedRole).not.toBeNull();
    expect(state.config.playerRole).toBe('investigator');
    expect(events).toContainEqual({ type: 'GAME_INITIALIZED', seed: 'DEMO' });

    // === STEP 2: Advance through Setup States ===
    console.log('\n🔄 Step 2: Advancing through setup states...');

    // seed-entry → mode-selection
    expect(state.currentState).toBe('seed-entry');
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('mode-selection');
    console.log('   ✅ Advanced to mode-selection');

    // mode-selection → role-selection
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('role-selection');
    console.log('   ✅ Advanced to role-selection');

    // role-selection → penalty-calibration
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('penalty-calibration');
    console.log('   ✅ Advanced to penalty-calibration');

    // === STEP 3: Penalty Calibration (3 practice attempts) ===
    console.log('\n⚠️  Step 3: Penalty calibration (3 attempts)...');
    expect(state.penaltyCalibration.penaltyText).toBe(state.selectedPenalty?.text);
    expect(state.penaltyCalibration.practiceAttempts).toBe(0);

    // Attempt 1
    engine.incrementCalibration();
    state = engine.getState();
    expect(state.penaltyCalibration.practiceAttempts).toBe(1);
    expect(state.penaltyCalibration.isComplete).toBe(false);
    console.log('   ✅ Practice attempt 1/3');

    // Attempt 2
    engine.incrementCalibration();
    state = engine.getState();
    expect(state.penaltyCalibration.practiceAttempts).toBe(2);
    expect(state.penaltyCalibration.isComplete).toBe(false);
    console.log('   ✅ Practice attempt 2/3');

    // Attempt 3
    engine.incrementCalibration();
    state = engine.getState();
    expect(state.penaltyCalibration.practiceAttempts).toBe(3);
    expect(state.penaltyCalibration.isComplete).toBe(true);
    console.log('   ✅ Practice attempt 3/3 - Calibration complete!');

    // === STEP 4: Advance through Content Display States ===
    console.log('\n📚 Step 4: Viewing game content...');

    // penalty-calibration → packet-display
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('packet-display');
    console.log(`   ✅ Viewing packet: ${state.selectedPacket?.name}`);
    console.log(`   📝 Questions: ${state.shuffledQuestions?.length} questions shuffled`);

    // packet-display → inducer-puzzle
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('inducer-puzzle');
    console.log(`   ✅ Inducer puzzle: ${state.inducerPattern?.grid.length} grid cells`);

    // inducer-puzzle → background-display
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('background-display');
    console.log(`   ✅ Background: ${state.selectedBackground?.name}`);

    // === STEP 5: Ready to Start (Timer start preparation) ===
    console.log('\n⏱️  Step 5: Ready to start interview...');

    // background-display → ready-to-start
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('ready-to-start');
    expect(state.timerStarted).toBe(false);
    console.log('   ✅ Reached ready-to-start state');

    // CRITICAL: Timer should NOT have started yet
    expect(state.timerStarted).toBe(false);
    console.log('   ✅ VERIFIED: Timer has NOT started (requires manual button click)');

    // Manually start timer (simulates "Start Interview" button click)
    engine.startTimer();
    state = engine.getState();
    expect(state.timerStarted).toBe(true);
    expect(events).toContainEqual({ type: 'TIMER_STARTED' });
    console.log('   ✅ Timer started manually');

    // === STEP 6: Interview Phase ===
    console.log('\n🎤 Step 6: Interview in progress...');

    // ready-to-start → interview
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('interview');
    console.log('   ✅ Interview phase started');
    console.log(`   ⏱️  Timer is running...`);

    // Simulate timer elapsing after 5 minutes
    console.log('   ⏱️  (Simulating 5 minutes passing...)');
    engine.onTimerElapsed();
    state = engine.getState();
    expect(state.timerElapsed).toBe(true);
    expect(events).toContainEqual({ type: 'TIMER_ELAPSED' });
    console.log('   ✅ Timer elapsed - interview time is up!');

    // === STEP 7: Determination ===
    console.log('\n⚖️  Step 7: Making determination...');

    const actualRole = state.selectedRole?.roleType;
    console.log(`   🎭 Actual role: ${actualRole}`);

    // Make correct determination based on actual role
    const correctDetermination = actualRole === RoleType.Human ? 'human' : 'robot';
    console.log(`   💭 Investigator determines: ${correctDetermination}`);

    engine.makeDetermination(correctDetermination);
    state = engine.getState();

    expect(state.determination).toBe(correctDetermination);
    expect(state.outcome).not.toBeNull();
    expect(state.outcome?.correct).toBe(true);
    expect(events).toContainEqual({
      type: 'DETERMINATION_MADE',
      determination: correctDetermination,
    });

    console.log('   ✅ Determination made');
    console.log(`   📊 Result: ${state.outcome?.correct ? 'CORRECT! ✅' : 'INCORRECT ❌'}`);

    // === STEP 8: Conclusion ===
    console.log('\n🏁 Step 8: Game conclusion...');

    // interview → conclusion
    engine.advanceState();
    state = engine.getState();
    expect(state.currentState).toBe('conclusion');
    console.log('   ✅ Game concluded');

    // Verify cannot advance further
    const canAdvance = engine.canAdvanceState();
    expect(canAdvance).toBe(false);
    console.log('   ✅ Cannot advance past conclusion (terminal state)');

    // === FINAL VERIFICATION ===
    console.log('\n📊 Final Verification:');
    console.log(`   • Total events emitted: ${events.length}`);
    console.log(`   • Game state: ${state.currentState}`);
    console.log(`   • Outcome: ${state.outcome?.correct ? 'Correct determination' : 'Incorrect determination'}`);
    console.log(`   • Determination: ${state.determination}`);
    console.log(`   • Actual role: ${state.outcome?.actualRole}`);

    // Verify all critical events were emitted
    const eventTypes = events.map((e) => e.type);
    expect(eventTypes).toContain('GAME_INITIALIZED');
    expect(eventTypes).toContain('CALIBRATION_INCREMENTED');
    expect(eventTypes).toContain('TIMER_STARTED');
    expect(eventTypes).toContain('TIMER_ELAPSED');
    expect(eventTypes).toContain('DETERMINATION_MADE');

    console.log('\n✅ COMPLETE: Full game flow executed successfully using ONLY GameEngine!');
    console.log('✅ PROVEN: Game logic is 100% testable without React\n');
  });

  it('should handle incorrect determination', () => {
    const engine = new GameEngine();

    engine.initialize({
      seed: 'TEST',
      mode: 'single-device',
    });

    // Advance to conclusion
    while (engine.getState().currentState !== 'interview') {
      engine.advanceState();
    }

    const state = engine.getState();
    const actualRole = state.selectedRole?.roleType;

    // Make WRONG determination
    const wrongDetermination = actualRole === RoleType.Human ? 'robot' : 'human';

    engine.makeDetermination(wrongDetermination);
    const finalState = engine.getState();

    expect(finalState.outcome?.correct).toBe(false);
    console.log('✅ Incorrect determination handled correctly');
  });

  it('should enforce game rules throughout flow', () => {
    const engine = new GameEngine();

    // Cannot start timer before initialization
    expect(() => engine.startTimer()).toThrow();

    engine.initialize({
      seed: 'TEST',
      mode: 'single-device',
    });

    // Cannot start timer in wrong state
    expect(() => engine.startTimer()).toThrow();

    // Advance to ready-to-start
    while (engine.getState().currentState !== 'ready-to-start') {
      engine.advanceState();
    }

    // Can start timer now
    engine.startTimer();

    // Cannot start timer twice
    expect(() => engine.startTimer()).toThrow('already been started');

    console.log('✅ All game rules enforced correctly');
  });

  it('should support deterministic multiplayer synchronization', () => {
    const investigatorEngine = new GameEngine();
    const suspectEngine = new GameEngine();

    // Both players initialize with same seed
    investigatorEngine.initialize({
      seed: 'SYNC',
      mode: 'multi-device',
      playerRole: 'investigator',
    });

    suspectEngine.initialize({
      seed: 'SYNC',
      mode: 'multi-device',
      playerRole: 'suspect',
    });

    // Both should have identical content
    const invState = investigatorEngine.getState();
    const susState = suspectEngine.getState();

    expect(invState.selectedPacket?.id).toBe(susState.selectedPacket?.id);
    expect(invState.selectedPenalty?.id).toBe(susState.selectedPenalty?.id);
    expect(invState.selectedRole?.roleType).toBe(susState.selectedRole?.roleType);
    expect(invState.selectedBackground?.id).toBe(susState.selectedBackground?.id);

    console.log('✅ Multi-device synchronization works perfectly');
    console.log('✅ Same seed = same content on all devices');
  });
});
