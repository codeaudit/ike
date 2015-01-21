package org.allenai.dictionary

import org.allenai.common.testkit.ScratchDirectory
import org.allenai.common.testkit.UnitSpec
import nl.inl.blacklab.queryParser.corpusql.CorpusQueryLanguageParser

class TestBlackLabSemantics extends UnitSpec with ScratchDirectory {
  TestData.createTestIndex(scratchDir)
  val searcher = TestData.testSearcher(scratchDir)
  val semantics = BlackLabSemantics(searcher)
  def results(s: String) = {
    val e = QExprParser.parse(s).get
    val q = semantics.blackLabQuery(e)
    val hits = searcher.find(q)
    BlackLabResult.fromHits(hits)
  }
  def search(s: String) = {
    for {
      result <- results(s)
      words = result.matchWords mkString(" ")
    } yield words
  }.toSet
  def searchGroups(s: String) = {
    for {
      result <- results(s)
      (groupName, offsets) <- result.captureGroups
      data = result.wordData.slice(offsets.start, offsets.end)
      words = data map (_.word) mkString " "
      named = s"$groupName $words"
    } yield named
  }.toSet
  
  "BlackLabSemantics" should "handle single word queries" in {
    assert(search("like") == Set("like"))
    assert(search("garbage") == Set.empty)
  }
  
  it should "handle pos tags" in {
    assert(search("NNS") == Set("bananas"))
    assert(search("PRP") == Set("I", "It", "They"))
  }
  
  it should "handle multi-term queries" in {
    assert(search("I VBP") == Set("I like", "I hate"))
    assert(search("PRP VBP") == Set("I like", "I hate", "It tastes", "They taste"))
  }
  
  it should "handle cluster prefix queries" in {
    assert(search("^0") == Set("I", "mango", "It", "bananas", "They"))
    assert(search("^00") == Set("mango", "bananas"))
  }
  
  it should "handle wildcard queries" in {
    assert(search("I .") == Set("I like", "I hate"))
  }
  
  it should "handle disjunctive queries" in {
    assert(search("like|hate") == Set("like", "hate"))
  }
  
  it should "handle repetition queries" in {
    assert(search("RB* JJ") == Set("great", "not great"))
    assert(search("RB+ JJ") == Set("not great"))
  }
  
  it should "handle groups" in {
    assert(searchGroups("I (?<x>VBP) DT* (?<y>NN|NNS)") == Set("x like", "y mango", "x hate", "y bananas"))
    assert(searchGroups("I (?<x>.*) (?<y>NN|NNS)") == Set("x like", "y mango", "x hate those", "y bananas"))
  }
  
}