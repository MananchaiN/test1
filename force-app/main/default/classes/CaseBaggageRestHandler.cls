public with sharing class CaseBaggageRestHandler {
	public static List<Map<String, Object>> getCaseBaggage(@InvocableVariable(name = 'SuppliedEmail') String suppliedEmail) {
		List<