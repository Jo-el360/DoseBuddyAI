import 'package:flutter/material.dart';
import '../services/api_service.dart';

class AIAssistantScreen extends StatefulWidget {
  const AIAssistantScreen({super.key});

  @override
  State<AIAssistantScreen> createState() => _AIAssistantScreenState();
}

class _AIAssistantScreenState extends State<AIAssistantScreen> {
  final TextEditingController _queryCtrl = TextEditingController();
  final List<Map<String, String>> _messages = [
    {
      'sender': 'bot',
      'text': 'Hello! I am your DoseBuddy AI Assistant. You can ask me about drug interactions, food precautions, missed doses, or scan a prescription label using OCR.',
    }
  ];
  bool _isAnalyzing = false;
  String _selectedLanguage = 'English';

  final List<String> _languages = ['English', 'Spanish', 'Tagalog', 'Hindi', 'Mandarin'];

  void _sendQuery(String promptText) async {
    if (promptText.trim().isEmpty) return;
    setState(() {
      _messages.add({'sender': 'user', 'text': promptText});
      _isAnalyzing = true;
    });
    _queryCtrl.clear();

    final aiReply = await ApiService.chatWithAI(promptText, 'Maria');

    String reply = aiReply;
    if (_selectedLanguage != 'English') {
      reply = '[$_selectedLanguage Translation] $reply';
    }

    if (mounted) {
      setState(() {
        _messages.add({'sender': 'bot', 'text': reply});
        _isAnalyzing = false;
      });
    }
  }

  void _simulateOCRScan() {
    setState(() {
      _isAnalyzing = true;
    });

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.camera_enhance, color: const Color(0xFF0369A1), size: 28),
                const SizedBox(width: 10),
                const Text(
                  'OCR Prescription Bottle Scanner',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                color: const Color(0xFFF1F5F9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF7DD3FC), width: 2),
              ),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Icon(Icons.medication_liquid, size: 80, color: const Color(0xFF94A3B8)),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      'Simulated Bottle Scan in Progress...',
                      style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Detected Label Data:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F9FF),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('• Name: Lisinopril 10 mg', style: TextStyle(fontWeight: FontWeight.bold)),
                  Text('• Instructions: Take 1 tablet daily in the morning'),
                  Text('• Refills Remaining: 3 refills'),
                  Text('• Pharmacy: CVS Pharmacy #4092'),
                ],
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pop(ctx);
                _sendQuery('I just scanned Lisinopril 10 mg. Are there any food warnings?');
              },
              icon: const Icon(Icons.add_task),
              label: const Text('Add to My Cabinet & Ask AI'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0369A1),
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('AI Health Assistant 🤖'),
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF0F172A),
        elevation: 0,
        actions: [
          DropdownButton<String>(
            value: _selectedLanguage,
            underline: const SizedBox(),
            icon: const Icon(Icons.language, color: Color(0xFF0284C7)),
            onChanged: (newLang) {
              if (newLang != null) setState(() => _selectedLanguage = newLang);
            },
            items: _languages.map((lang) {
              return DropdownMenuItem(value: lang, child: Text(lang, style: const TextStyle(fontSize: 13)));
            }).toList(),
          ),
          const SizedBox(width: 12),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Scanner Banner
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              color: const Color(0xFFF0F9FF),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: const Color(0xFFE0F2FE),
                    child: Icon(Icons.document_scanner, color: const Color(0xFF075985)),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Scan Rx Pill Bottle', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                        Text('Auto-extract dosage & interactions', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                      ],
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: _simulateOCRScan,
                    icon: const Icon(Icons.camera_alt, size: 16),
                    label: const Text('Scan Label'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0369A1),
                      foregroundColor: Colors.white,
                    ),
                  ),
                ],
              ),
            ),

            // Chat Messages List
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (ctx, idx) {
                  final msg = _messages[idx];
                  final isBot = msg['sender'] == 'bot';
                  return Align(
                    alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                      decoration: BoxDecoration(
                        color: isBot ? Colors.white : const Color(0xFF0369A1),
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(16),
                          topRight: const Radius.circular(16),
                          bottomLeft: Radius.circular(isBot ? 4 : 16),
                          bottomRight: Radius.circular(isBot ? 16 : 4),
                        ),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 4, offset: const Offset(0, 2)),
                        ],
                      ),
                      child: Text(
                        msg['text']!,
                        style: TextStyle(
                          color: isBot ? const Color(0xFF0F172A) : Colors.white,
                          fontSize: 15,
                          height: 1.4,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

            if (_isAnalyzing)
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFF0369A1))),
                    const SizedBox(width: 8),
                    const Text('DoseBuddy AI is thinking...', style: TextStyle(fontSize: 12, color: Color(0xFF64748B))),
                  ],
                ),
              ),

            // Quick Suggestion Chips
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  ActionChip(
                    avatar: const Icon(Icons.warning_amber, size: 16, color: Colors.amber),
                    label: const Text('Metformin + Grapefruit?'),
                    onPressed: () => _sendQuery('Can I take Metformin with Grapefruit?'),
                  ),
                  const SizedBox(width: 8),
                  ActionChip(
                    avatar: const Icon(Icons.help_outline, size: 16, color: Color(0xFF0284C7)),
                    label: const Text('What if I miss a dose?'),
                    onPressed: () => _sendQuery('What should I do if I forgot my dose?'),
                  ),
                ],
              ),
            ),

            // Input Bar
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.white,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _queryCtrl,
                      decoration: InputDecoration(
                        hintText: 'Ask about pills, side effects, timing...',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(24)),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        filled: true,
                        fillColor: const Color(0xFFF1F5F9),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  CircleAvatar(
                    backgroundColor: const Color(0xFF0369A1),
                    child: IconButton(
                      icon: const Icon(Icons.send, color: Colors.white, size: 20),
                      onPressed: () => _sendQuery(_queryCtrl.text),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
