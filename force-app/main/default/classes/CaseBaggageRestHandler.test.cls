public with sharing class CaseBaggageRestHandlerTest {
    @IsTest
    static void testGetCaseBaggage() {
        // Arrange
        String suppliedEmail = 'test@example.com';
        List<Map<String, Object>> expectedResults = new List<Map<String, Object